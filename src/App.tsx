import React, { useState, useEffect, useRef, useMemo } from "react";
import { GoogleGenAI, Chat } from "@google/genai";
import { 
  BookOpen, Activity, Save, FileText, Send, Play, 
  Terminal, Database, CheckCircle, AlertCircle,
  Cpu, FileCode, GraduationCap, Layout, RefreshCw, ChevronRight,
  Bot, User, FileDigit, Calendar, FolderOpen, X, Plus, FilePlus, RefreshCcw,
  History, Upload, CloudUpload, ArrowLeft, Trash2, CheckSquare, Square,
  Settings, Wifi, WifiOff, Zap, ShieldCheck, Globe
} from "lucide-react";

// --- SYSTEM PROMPT (VERSION 1.2 - Evidence-Disciplined) ---
const SYSTEM_PROMPT = `
# SYSTEM PROMPT — NMLE (China) Written Exam Learning OS (TRAE / Repo-based)
Version: 1.2 (Full, Evidence-Disciplined)
Scope: Clinical Practicing Physician (临床执业医师) | Target: Aug 2026

You are an exam-prep tutor AND a repo-based learning operating system for China’s National Medical Licensing Examination (Written), track = Clinical Practicing Physician (临床执业医师), target window = August 2026.

Your job is to maximize pass probability with the least wasted study time, using guided learning + structured persistence to the repository.

===============================================================================
0) NON-NEGOTIABLE RULES
===============================================================================

0.1 OUTPUT LANGUAGE (MANDATORY)
- All user-facing responses MUST be in Simplified Chinese.
- This system prompt is written in English; outputs must be Chinese.

0.2 EXAM-FIRST (NOT CLINIC-FIRST)
- Always optimize for exam performance: tested points, stem triggers, traps, elimination strategy, differential patterns.
- Do NOT drift into broad medical lectures.
- Organize content around: 可考点、易错点、题干陷阱、选择题策略.
- Default assumption: user understanding has gaps; diagnose with questions before teaching.

0.3 STYLE & BOTTOM LINE (MANDATORY)
- No flattery, no empty “科普”.
- Always verify: use questions + evidence to confirm assumptions and user claims.
- If the user’s statement lacks evidence, treat it as a hypothesis: ask 1–2 check questions or request excerpt.
- Prefer short cycles: 问 → 证据 → 结论 → 小测 → 纠错 → 入库.
- Avoid long narratives unless they increase exam score.

0.4 NO GUESSING (CRITICAL)
- Do NOT guess any factual, numeric, or rule-sensitive item, especially:
  - Diagnostic criteria thresholds, staging cutoffs
  - Drug dosing, contraindications, adverse effect details
  - Laws/regulations, infectious disease reporting rules
  - Guideline-driven algorithms where wording matters
- If not verifiable from authoritative sources available in repo or via tools:
  1) Mark explicitly: “不确定/需核对”
  2) Provide a verification path (official source type + where to find)
  3) Add it to the tracker “Verification Queue”
- If tools allow web browsing, use authoritative sources ONLY and cite briefly (org + doc + year).
- If no browsing, ask user to paste relevant excerpt; reason strictly from it.
- 禁止凭印象编造：凡无法核对的细节（数值/分级/阈值/年款变化点），必须降级为“不确定/需核对”。

0.5 HIGH-VARIABILITY WARNING (MANDATORY)
- Any content involving laws/regulations, diagnostic criteria, guideline algorithms, thresholds, infectious disease classifications/reporting:
  - Must include: “以当年考试大纲与最新法规/指南为准”
  - If year/version unknown: mark “不确定/需核对” and add a Verification Queue item.

0.6 EVIDENCE & CREDIBILITY LABELING (MUST EXECUTE)
- For every key conclusion / key rule / high-frequency tested point, append:
  - Confidence: 高 / 中 / 低
  - Source Type: 官方大纲 / 官方教材 / 国家法律法规 / 指南或共识 / 经典教材 / 经验推断
- If you cannot confirm the source type, Confidence MUST be “低”, and you MUST provide a verification path.
- Do not claim a guideline/law/year if you cannot cite it. Mark “不确定/需核对”.
- If multiple sources conflict, follow section 3.3 authority order and mark unresolved items as “不确定/需核对”.

0.7 SAFETY BOUNDARY (EXAM ONLY)
- This system is for exam preparation, not real patient care.
- If the user asks patient-specific diagnosis/treatment: provide general educational context and advise seeing a licensed clinician; do NOT prescribe or give step-by-step treatment for a real person.

0.8 COPYRIGHT SAFE
- Generate ORIGINAL practice questions or heavily paraphrased isomorphic items.
- Never reproduce copyrighted commercial question stems verbatim.

===============================================================================
1) TEACHING METHOD (LEARNING SCIENCE — MUST IMPLEMENT)
===============================================================================

You MUST explicitly implement these strategies:
1) Socratic Method: diagnose what the user already knows before teaching.
2) Retrieval Practice: after every micro-lesson, force recall (user explanation + micro-quiz).
3) Error-Driven Learning: every mistake must be categorized + minimal fix + trigger rule + flashcard.
4) Spaced Repetition: schedule reviews (D+1, D+3, D+7, D+14, D+30).
5) Interleaving: mix similar diseases/drugs/concepts later to prevent shallow pattern matching.

Style constraints:
- Keep explanations compact and exam-linked.
- Prefer short cycles: teach → test → fix → persist.
- Default output structure: 可考点 → 触发词 → 陷阱/易错点 → 选择题策略 → 小测.

===============================================================================
2) REPO-BASED PERSISTENCE (SINGLE SOURCE OF TRUTH)
===============================================================================

This environment uses a repository as memory. You must read/write files (if allowed).
If you cannot write files directly, instruct the user to run the scripts and/or copy blocks into files.

Required repo structure (create if missing):
/reference/
  00_INDEX.md
  _manifest.json
  raw/
  digests/
  _digest_template.md
/progress/
  nmle-study-tracker.md          <- SINGLE MASTER TRACKER (single source of truth)
/sessions/
  YYYY-MM-DD/
    session-notes.md

CRITICAL:
- Do NOT create multiple trackers. Only /progress/nmle-study-tracker.md is the master state.
- Session details go to /sessions/YYYY-MM-DD/session-notes.md.

===============================================================================
3) REFERENCE LIBRARY = LOCAL AUTHORITY (AUTOMATION-FIRST)
===============================================================================

The folder \`/reference/raw/\` contains the user’s authoritative files (pdf/docx/md/txt/html).
Goal: the user should NOT manually maintain index/digests.

3.1 FAST RETRIEVAL ORDER (speed-first)
- Always consult:
  1) /reference/00_INDEX.md
  2) /reference/digests/* (preferred)
  3) /reference/raw/* (last resort; only when needed for verification)

3.2 CITATION FORMAT (in answers)
- When you use reference content, cite in answers as:
  [REF:Rxxx §Section] or [REF:Rxxx file]
- If you cannot pinpoint a page reliably, cite by section heading + keywords, not fake page numbers.

3.3 CONFLICT RESOLUTION (authority order)
If sources conflict, prioritize:
A) Official syllabus / national laws & regulations
B) Authoritative national guidelines/consensus
C) Standard textbooks / official teaching materials
D) Personal notes / summaries

If unresolved:
- show both positions briefly
- mark “不确定/需核对”
- create a Verification Queue item (what to check, where, why)

===============================================================================
4) REFERENCE AUTO-SYNC WORKFLOW (ZERO-MANUAL)
===============================================================================

This project includes a script:
- \`npm run refsync\`  (checks /reference/raw and updates 00_INDEX + digests)

At the beginning of EACH NEW STUDY SESSION, you MUST do a "Reference Preflight":
1) Check whether reference index/digests are in sync:
   - If you can run shell: run \`npm run refsync\`
   - If you cannot run shell: instruct the user to run \`npm run refsync\` and paste the terminal output summary.
2) After preflight, proceed to learning.

User-facing preflight prompt (Simplified Chinese, single yes/no):
- “我将先同步 reference 资料库（检查新增/变更并生成digest）。现在要同步吗？(是/否)”
If user says yes:
- Ensure sync happens (script or guided instruction).
If user says no:
- Continue, but warn: “未同步可能影响引用准确性”。

===============================================================================
5) STUDY SESSION LOOP (MANDATORY, EVERY SESSION)
===============================================================================

Choose a Mode each session:
- Mode A: Concept Mastery（章节/专题精讲）
- Mode B: Question Drills（专项刷题）
- Mode C: Mixed Review（交错复习）
- Mode D: Sprint（冲刺查漏补缺）
- Mode E: Mock（模拟考试）

Then execute:

Step 0 — Setup
- Confirm session duration (default 25 minutes if unknown).
- Confirm target topic (if unknown, pick highest priority from tracker weak topics).

Step 1 — Rapid Diagnostic (2–5 minutes)
- Ask 3–5 short questions designed to expose:
  - concept gaps
  - stem traps
  - common confusions
  - elimination mistakes
- Ask confidence (1–5) for each answer.
- If user confidence high but answer wrong: categorize as “概念混淆/审题失误/过度推断” as appropriate.

Step 2 — Micro-Lesson (concise, exam-linked)
Use this exact template (Simplified Chinese):
- 考点一句话：
- 核心逻辑/机制：
- 题干触发词（trigger）：
- 易错点/题干陷阱（1–2条）：
- 选择题策略（如何排除/怎么选）：
- 重要提醒：涉及阈值/分级/法规/指南 → “以当年考试大纲与最新法规/指南为准”
- 可信度：高/中/低；来源类型：官方大纲/官方教材/国家法律法规/指南或共识/经典教材/经验推断（不明则低+核对路径）

Constraint:
- Keep each micro-lesson ~200–350 Chinese characters if possible.

Step 3 — Immediate Retrieval Check
- Provide 3 micro-questions per concept (vary formats).
- Do NOT reveal answers before user commits (unless asked).
- After user answers: do targeted correction; do NOT re-lecture.

Step 4 — Error Analysis & Fix
- For each wrong/uncertain answer:
  - classify with taxonomy (section 6)
  - write misconception + minimal fix + trigger rule
  - create flashcard + schedule review
  - if any rule/number uncertain: add Verification Queue item with verification path
- Every fix must be minimal and exam-triggered (what stem cue should trigger what action).

Step 5 — Session Summary (must use template)
- 本次掌握：
- 本次未掌握（可训练表述）：
- 错因统计（按error_type）：
- 下次优先级Top3：
- 今日/本周行动清单：
- Evidence Footer（关键结论1–3条）：
  - 结论A：Confidence=__；Source Type=__；（不确定→核对路径+Verification Queue）
  - 结论B：Confidence=__；Source Type=__；
  - 结论C：Confidence=__；Source Type=__；

Step 6 — Persist (Two-step writing)
- Write /sessions/YYYY-MM-DD/session-notes.md
- Update /progress/nmle-study-tracker.md

If you cannot write files:
- Output two copy-paste blocks titled:
  1) “SESSION NOTES BLOCK”
  2) “TRACKER UPDATE BLOCK”

===============================================================================
6) ERROR TAXONOMY (CONTROLLED VOCAB, MUST USE)
===============================================================================

Each mistake must be exactly one:
- 知识缺口 (Knowledge Gap)
- 概念混淆 (Concept Confusion)
- 审题失误 (Stem Misread)
- 记忆不牢 (Memory)
- 计算/单位错误 (Calculation)
- 选择题策略失误 (Test-taking Strategy)
- 过度推断/临床经验代替考点 (Over-clinical)

For each error you MUST output:
- 错因类型：
- 误解点（misconception）：
- 最小修复（minimal fix, 1–3 lines）：
- 触发规则（trigger rule）：
- 闪卡（front/back + tags + review schedule）：
- 可信度与来源类型：Confidence=高/中/低；Source Type=...
  - 若来源不明：Confidence=低；并给核对路径；加入 Verification Queue

===============================================================================
7) QUESTION GENERATION (EXAM-LIKE FORMATS, SAFE)
===============================================================================

Use exam-like formats (original/paraphrased):
- A1: 单项选择（短题干）
- A2: 病例单选
- A3/A4: 病例组题（递进信息）
- B1: 配伍匹配（选项库）

For each question include:
- 正确答案
- 关键理由（≤120字）
- 最关键排除点（≤80字）
- trigger（题干触发词）
- 可信度：高/中/低；来源类型：官方大纲/官方教材/国家法律法规/指南或共识/经典教材/经验推断
  - 若为推断题：必须标“经验推断”，且提示“以当年考试大纲与最新法规/指南为准”（如涉及阈值/法规/指南）

===============================================================================
8) TRACKER (MASTER STATE) — TEMPLATE & UPDATE RULES
===============================================================================

File: /progress/nmle-study-tracker.md  (single source of truth)

If missing, create with:

# NMLE Study Tracker — Clinical Practicing Physician (临床执业医师)
Target: Aug 2026
Last Updated: YYYY-MM-DD

## 1) Profile
- Weekly hours:
- Baseline level:
- Resources (syllabus/textbooks/qbanks):
- Notes: (constraints, deadlines)

## 2) Module Progress (evidence-based)
| Module | Mastery (0-100) | Last 7d Accuracy | Last 30d Accuracy | Key Weak Areas |
|---|---:|---:|---:|---|
| 基础医学 | 0 | - | - | |
| 临床医学 | 0 | - | - | |
| 预防医学 | 0 | - | - | |
| 人文法规伦理 | 0 | - | - | |

## 3) Weak Topics (Top10, highest priority first)
- Topic | Module | Severity(H/M/L) | Evidence(accuracy/errors) | Status

## 4) Topics Mastered (with dates)
- YYYY-MM-DD | Topic | Confidence | Evidence

## 5) Error Log (latest first)
- Date | Topic | Q-type | error_type | misconception | minimal fix | trigger rule | refs

## 6) Flashcards Queue
- Front | Back | Tags | Next Review (D+1/D+3/D+7/D+14/D+30)

## 7) Verification Queue (NO GUESSING)
- Item | Why uncertain | Needed source | Status

## 8) Plan
### Current Phase
- Foundation / Consolidation / Intensive / Sprint
### Next Session Top3
1)
2)
3)
### Weekly Schedule (time blocks)
- Day → blocks → topic → review

## 9) Quick Stats
- Sessions completed:
- Overall accuracy (7d):
- Overall accuracy (30d):
- Avg confidence:
- Streak:

Update rules:
- Mastery is evidence-based (accuracy + confidence + explanation quality), not self-report.
- Weak Topics sorted by: high frequency × low accuracy × high confusion.
- Every VERIFY item must appear in Verification Queue, never buried in prose.

===============================================================================
9) SESSION NOTES TEMPLATE (PER-DAY)
===============================================================================

File: /sessions/YYYY-MM-DD/session-notes.md

# Session Notes — YYYY-MM-DD
## Overview
- Duration:
- Mode:
- Main topics:
- Reference used: [REF:...]

## Baseline Diagnostic (questions + confidence)
- Q:
- A:
- Confidence:
- Result:

## Concepts Taught (micro-lessons)
- Concept:
- Key triggers:
- Traps:
- Evidence Footer (key conclusions):
  - Conclusion:
  - Confidence:
  - Source Type:
  - Verification path (if uncertain):

## Practice Questions
- Q summary:
- Student answer:
- Correct:
- Error type:
- Fix:
- Flashcard added:
- Confidence & Source Type (for key rule used):

## Knowledge Gaps Identified
- Gap + severity + evidence

## Topics Mastered
- Topic + confidence + evidence

## Follow-ups
- Next review dates:
- Next session candidates:
- Verification Queue items added:

===============================================================================
10) DEFAULT PHASE PLAN (AUG 2026)
===============================================================================

Maintain phase in tracker:
- Phase 1: Foundation (core concepts + triggers)
- Phase 2: Consolidation (mixed drills + differential)
- Phase 3: Intensive (volume + strict correction)
- Phase 4: Sprint (weakness kill + time management + mock)

When weekly_hours is known:
- Propose daily blocks 25–60 min
- Include spaced review blocks
- 1–2 interleaving days/week
- periodic mock exams (original/paraphrased)

===============================================================================
11) COMMANDS (USER SHORTCUTS)
===============================================================================

The user may type these commands:
- /start
  - Run Reference Preflight (section 4), then begin session loop.
- /plan
  - Generate/update phase plan + weekly schedule based on tracker.
- /diagnose
  - 5-question cross-module diagnostic; update Weak Topics Top10.
- /drill <topic> <n>
  - Focused drill set; update error log + flashcards + mastery.
- /review <D+1|D+3|D+7|D+14|D+30|overdue>
  - Spaced repetition session from tracker flashcards.
- /mock <minutes>
  - Timed mock; no explanations until end; then full breakdown.
- /refsync
  - Force Reference Preflight + sync now.

===============================================================================
12) FIRST-TURN MINIMAL QUESTIONS (ASK ONCE, MAX 4)
===============================================================================

On the first interaction only (then proceed even if unanswered):
1) 每周可投入学习小时数？
2) 目前阶段：应届/规培/工作？最薄弱模块是什么？
3) 已有资源：大纲/教材/题库有哪些？是否放入 /reference/raw？
4) 今天模式：精讲/刷题/交错/冲刺/模拟？

Then immediately continue with /start flow (preflight → diagnostic).

===============================================================================
13) SELF-CHECK (SILENT)
===============================================================================

Before every reply, ensure:
- Did I diagnose before teaching?
- Did I enforce retrieval practice?
- Did I center “可考点/易错点/题干陷阱/选择题策略”?
- Did I avoid flattery and empty lecturing?
- Did I label uncertainty (“不确定/需核对”) and add VERIFY items?
- Did I attach Confidence + Source Type for key conclusions?
- Did I add “以当年考试大纲与最新法规/指南为准” where applicable?
- Did I create flashcards for weaknesses?
- Did I persist session notes + tracker updates (or output copy blocks)?
`;

// --- INITIAL STATE & TYPES ---

// Updated to align with Prompt Section 8
const INITIAL_TRACKER = `# NMLE Study Tracker — Clinical Practicing Physician (临床执业医师)
Target: Aug 2026
Last Updated: ${new Date().toISOString().split('T')[0]}

## 1) Profile
- Weekly hours: Not set
- Baseline level: Unknown
- Resources: None
- Notes:

## 2) Module Progress (evidence-based)
| Module | Mastery (0-100) | Last 7d Accuracy | Last 30d Accuracy | Key Weak Areas |
|---|---:|---:|---:|---|
| 基础医学 | 0 | - | - | |
| 临床医学 | 0 | - | - | |
| 预防医学 | 0 | - | - | |
| 人文法规伦理 | 0 | - | - | |

## 3) Weak Topics (Top10, highest priority first)
- None yet

## 4) Topics Mastered (with dates)
- None yet

## 5) Error Log (latest first)
- Date | Topic | Q-type | error_type | misconception | minimal fix | trigger rule | refs

## 6) Flashcards Queue
- Front | Back | Tags | Next Review

## 7) Verification Queue (NO GUESSING)
- Item | Why uncertain | Needed source | Status

## 8) Plan
### Current Phase
- Foundation
### Next Session Top3
1)
2)
3)
### Weekly Schedule
- Not set

## 9) Quick Stats
- Sessions completed: 0
- Overall accuracy (7d): -
- Overall accuracy (30d): -
- Avg confidence: -
- Streak: 0
`;

const INITIAL_INDEX = `# Reference Index
Run /refsync to populate.
`;

const INITIAL_MANIFEST = `{
  "files": {},
  "nextId": 1
}`;

interface FileSystem {
  [path: string]: string;
}

interface Message {
  role: "user" | "model";
  content: string;
}

// --- API CONFIG TYPES ---
type ProviderType = "google" | "openai";

interface ApiConfig {
  provider: ProviderType;
  displayName: string;
  apiKey: string;
  modelId: string;
  baseUrl: string;
}

const DEFAULT_CONFIG: ApiConfig = {
    provider: "google",
    displayName: "Default Gemini",
    apiKey: "", // UPDATED: Empty string for browser safety. User must input in Settings.
    modelId: "", // Default to code-specified fallback if empty
    baseUrl: ""
};

// --- HELPER COMPONENTS ---

const MarkdownView = ({ content }: { content: string }) => {
  if (!content) return <div className="text-slate-400 italic p-8 text-center text-xs">File content is empty.</div>;
  return (
    <div className="whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed text-slate-700 break-words overflow-x-auto">
      {content}
    </div>
  );
};

const FileEditor = ({ title, content, path, icon: Icon }: any) => (
  <div className="flex flex-col h-full bg-white shadow-sm overflow-hidden">
    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0 h-16">
      <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
        <Icon className="w-4 h-4 text-teal-600" />
        <span className="truncate max-w-[150px]">{title}</span>
      </div>
      <div className="flex items-center gap-2">
         <span className="text-[10px] text-slate-400 font-mono hidden md:inline-block truncate max-w-[120px]">{path}</span>
         <div className="px-2 py-1 bg-teal-50 text-teal-700 text-[10px] uppercase font-bold tracking-wider rounded border border-teal-100">
           Read Only
         </div>
      </div>
    </div>
    <div className="flex-1 overflow-auto p-4 bg-white">
      <MarkdownView content={content} />
    </div>
  </div>
);

// --- SETTINGS MODAL (Compatibility Fix Applied) ---
const SettingsModal = ({ isOpen, onClose, config, onSave }: { isOpen: boolean, onClose: () => void, config: ApiConfig, onSave: (c: ApiConfig) => void }) => {
  const [formData, setFormData] = useState<ApiConfig>(config);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMsg, setTestMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
        setFormData(config);
        setTestStatus("idle");
        setTestMsg("");
    }
  }, [isOpen, config]);

  const handleTestConnection = async () => {
      setTestStatus("testing");
      setTestMsg("");
      try {
          if (formData.provider === 'google') {
            const clientOptions: any = { apiKey: formData.apiKey };
            if (formData.baseUrl) clientOptions.baseUrl = formData.baseUrl;
            const ai = new GoogleGenAI(clientOptions);
            const modelName = formData.modelId || 'gemini-3-flash-preview';
            await ai.models.generateContent({
                model: modelName,
                contents: { parts: [{ text: "Hello" }] },
                config: { maxOutputTokens: 5 }
            });
          } else {
             // OpenAI Compatible Test
             const baseUrl = formData.baseUrl || "https://api.openai.com/v1";
             const url = baseUrl.endsWith("/") ? `${baseUrl}chat/completions` : `${baseUrl}/chat/completions`;
             const modelName = formData.modelId || "gpt-3.5-turbo";
             
             const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${formData.apiKey}`
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: [{ role: "user", content: "Hello" }],
                    // No max_tokens for compatibility
                })
             });
             if (!res.ok) {
                 const errText = await res.text();
                 throw new Error(`HTTP ${res.status}: ${errText}`);
             }
          }
          setTestStatus("success");
          setTestMsg("Connection Verified");
      } catch (e: any) {
          console.error(e);
          setTestStatus("error");
          setTestMsg(e.message || "Connection Failed");
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-600" />
            API Connection Settings
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 space-y-6 bg-slate-50/30">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Provider Type</label>
                  <div className="relative">
                    <select 
                        value={formData.provider}
                        onChange={(e) => setFormData({...formData, provider: e.target.value as ProviderType})}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none transition-all shadow-sm"
                    >
                        <option value="google">Google GenAI (Native SDK)</option>
                        <option value="openai">OpenAI Compatible (Universal)</option>
                    </select>
                    <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                        {formData.provider === 'google' ? <Zap className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    </div>
                  </div>
              </div>

              <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Display Name</label>
                  <input 
                    type="text" 
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    placeholder="My API Config"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                  />
              </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">API Key</label>
            <div className="relative">
                <ShieldCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                    type="password" 
                    value={formData.apiKey}
                    onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                    placeholder={formData.provider === 'google' ? "AIzaSy..." : "sk-..."}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Model ID (Recommended)</label>
                  <input 
                    type="text" 
                    value={formData.modelId}
                    onChange={(e) => setFormData({...formData, modelId: e.target.value})}
                    placeholder={formData.provider === 'google' ? "gemini-3-flash-preview (Default)" : "gpt-4o (Default)"}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm placeholder:text-slate-400"
                  />
                  <p className="text-[10px] text-slate-400">Leave blank to use system defaults.</p>
              </div>

              <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Base URL (Optional / Required for Other)</label>
                  <input 
                    type="text" 
                    value={formData.baseUrl}
                    onChange={(e) => setFormData({...formData, baseUrl: e.target.value})}
                    placeholder={formData.provider === 'google' ? "Leave empty for Google" : "https://api.openai.com/v1"}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm placeholder:text-slate-400"
                  />
                  <p className="text-[10px] text-slate-400">For 'Other', provide full endpoint base (e.g. including /v1)</p>
              </div>
          </div>
        </div>

        <div className="px-8 py-5 bg-white border-t border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
               <button 
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing' || !formData.apiKey}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all ${
                      testStatus === 'success' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 
                      testStatus === 'error' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' :
                      'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
               >
                   {testStatus === 'testing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 
                    testStatus === 'success' ? <Wifi className="w-3.5 h-3.5" /> : 
                    testStatus === 'error' ? <WifiOff className="w-3.5 h-3.5" /> :
                    <Zap className="w-3.5 h-3.5" />
                   }
                   {testStatus === 'testing' ? "Connecting..." : "Test Connection"}
               </button>
               {testMsg && (
                   <span className={`text-xs font-medium animate-in fade-in slide-in-from-left-2 ${
                       testStatus === 'success' ? 'text-green-600' : 
                       testStatus === 'error' ? 'text-red-500' : 'text-slate-500'
                   }`}>
                       {testMsg}
                   </span>
               )}
           </div>

           <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg transition-colors">
                Cancel
            </button>
            <button onClick={() => onSave(formData)} className="px-6 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-all shadow-lg shadow-teal-600/20 hover:shadow-teal-600/30">
                Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- SESSION COMPONENT (UNCHANGED) ---
const SessionManager = ({ files, currentDate, onDelete }: any) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Filter sessions
  const sessionFiles = Object.keys(files)
    .filter(k => k.startsWith("/sessions/"))
    .sort()
    .reverse();

  const toggleSelect = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedItems);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setSelectedItems(next);
  };

  const handleBatchDelete = () => {
    if (selectedItems.size === 0) return;
    onDelete(Array.from(selectedItems));
    setSelectedItems(new Set());
  };

  const handleDeleteSingle = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete([path]);
    if (selectedItems.has(path)) {
        const next = new Set(selectedItems);
        next.delete(path);
        setSelectedItems(next);
    }
  };

  // If viewing a file
  if (selectedFile && files[selectedFile] !== undefined) {
     return (
        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-4 duration-200">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between h-16 shrink-0">
                <button 
                  onClick={() => setSelectedFile(null)} 
                  className="px-2 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:text-teal-600 hover:border-teal-500 flex items-center gap-1 transition-colors"
                >
                    <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <div className="flex items-center gap-2 overflow-hidden">
                   <FileCode className="w-4 h-4 text-teal-600 shrink-0" />
                   <span className="text-xs font-mono truncate max-w-[200px] text-slate-700">{selectedFile}</span>
                </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-white">
                 <MarkdownView content={files[selectedFile] || ""} />
            </div>
        </div>
    );
  }

  // List View
  return (
    <div className="flex flex-col h-full bg-white shadow-sm overflow-hidden">
       <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0 h-16">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
          <History className="w-4 h-4 text-teal-600" />
          <span>Session History</span>
        </div>
        
        {selectedItems.size > 0 ? (
            <button 
                onClick={handleBatchDelete}
                className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded border border-red-200 hover:bg-red-100 transition-colors animate-in fade-in"
            >
                <Trash2 className="w-3 h-3" /> Delete ({selectedItems.size})
            </button>
        ) : (
            <div className="bg-teal-100 text-teal-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {sessionFiles.length}
            </div>
        )}
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-2 bg-slate-50/30">
        {sessionFiles.map(path => {
           const isToday = path.includes(currentDate);
           const dateStr = path.match(/\/sessions\/(.*?)\//)?.[1] || "Unknown Date";
           const isSelected = selectedItems.has(path);
           
           return (
            <div 
                key={path} 
                onClick={() => setSelectedFile(path)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border shadow-sm ${isSelected ? "bg-teal-50 border-teal-300" : isToday ? "bg-white border-teal-200 hover:border-teal-300" : "bg-white border-slate-200 hover:border-slate-300"}`}
            >
                <div className="flex items-center gap-3">
                    <button 
                        onClick={(e) => toggleSelect(path, e)}
                        className={`p-1 rounded hover:bg-black/5 transition-colors ${isSelected ? "text-teal-600" : "text-slate-300"}`}
                    >
                        {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                    <div className={`p-2 rounded-lg ${isToday ? "bg-teal-50 text-teal-600" : "bg-slate-100 text-slate-500"}`}>
                        <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-xs font-bold ${isToday ? "text-teal-900" : "text-slate-700"}`}>
                        {dateStr}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">session-notes.md</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={(e) => handleDeleteSingle(path, e)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                </div>
            </div>
           );
        })}
        {sessionFiles.length === 0 && <div className="text-slate-400 text-xs p-8 text-center italic">No sessions recorded yet.</div>}
      </div>
    </div>
  );
};


// --- REFERENCE MANAGER (UNCHANGED) ---
const ReferenceManager = ({ files, onAddFile, onSync, onDelete }: any) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rawFiles = Object.keys(files).filter(k => k.startsWith("/reference/raw/"));
  const digestFiles = Object.keys(files).filter(k => k.startsWith("/reference/digests/"));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedFiles = Array.from(e.target.files);
      
      for (const file of uploadedFiles) {
        const path = `/reference/raw/${file.name}`;
        try {
            const text = await file.text();
            onAddFile(path, text);
        } catch (err) {
            console.error("Upload error", err);
            onAddFile(path, `[Error reading file: ${err}]`);
        }
      }
      
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleSelect = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedItems);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setSelectedItems(next);
  };

  const handleBatchDelete = () => {
    if (selectedItems.size === 0) return;
    onDelete(Array.from(selectedItems));
    setSelectedItems(new Set());
  };

  const handleDeleteSingle = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete([path]);
    if (selectedItems.has(path)) {
        const next = new Set(selectedItems);
        next.delete(path);
        setSelectedItems(next);
    }
  };

  if (selectedFile && files[selectedFile] !== undefined) {
    return (
        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-4 duration-200">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between h-16 shrink-0">
                <button 
                  onClick={() => setSelectedFile(null)} 
                  className="px-2 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:text-teal-600 hover:border-teal-500 flex items-center gap-1 transition-colors"
                >
                    <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <span className="text-xs font-mono truncate max-w-[200px] text-slate-700">{selectedFile}</span>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-white">
                 <MarkdownView content={files[selectedFile] || ""} />
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0 h-16">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
          <Database className="w-4 h-4 text-teal-600" />
          <span>Reference Library</span>
        </div>
        <div className="flex items-center gap-2">
            {selectedItems.size > 0 && (
                <button 
                    onClick={handleBatchDelete}
                    className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded border border-red-200 hover:bg-red-100 transition-colors animate-in fade-in"
                >
                    <Trash2 className="w-3 h-3" /> Delete ({selectedItems.size})
                </button>
            )}
            <button 
            onClick={onSync}
            className="flex items-center gap-1 px-2 py-1 bg-teal-600 text-white text-[10px] font-bold uppercase rounded hover:bg-teal-700 transition-colors shadow-sm"
            >
            <RefreshCcw className="w-3 h-3" /> Sync
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white p-4 space-y-6">
        {/* Actions */}
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            multiple 
            className="hidden" 
        />
        <button 
             onClick={() => fileInputRef.current?.click()}
             className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/50 transition-all group"
           >
             <CloudUpload className="w-6 h-6 mb-1 text-slate-300 group-hover:text-teal-500" />
             <span className="text-sm font-medium">Upload Files to /raw/</span>
             <span className="text-[10px] text-slate-300 group-hover:text-teal-400/70">Supports .md .txt .pdf .docx .json</span>
        </button>

        {/* Index Preview */}
        <div>
            <div className="flex items-center justify-between mb-2">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">00_INDEX.md</h3>
                 <button onClick={() => setSelectedFile("/reference/00_INDEX.md")} className="text-[10px] text-teal-600 hover:underline">View</button>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[10px] font-mono text-slate-600 line-clamp-4 bg-slate-50/50">
                {files["/reference/00_INDEX.md"] || "(Index is empty)"}
            </div>
        </div>

        {/* Raw Files List */}
        <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Raw Files</span>
                <span className="bg-slate-100 px-1.5 rounded text-slate-500">{rawFiles.length}</span>
            </h3>
            <div className="space-y-1">
                {rawFiles.length === 0 && <div className="text-xs text-slate-400 italic py-2">No raw files. Upload above.</div>}
                {rawFiles.map(path => {
                    const isSelected = selectedItems.has(path);
                    return (
                        <div key={path} onClick={() => setSelectedFile(path)} className={`group flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border ${isSelected ? "border-teal-200 bg-teal-50/50" : "border-transparent hover:border-slate-100"}`}>
                            <div className="flex items-center gap-2 overflow-hidden">
                                <button 
                                    onClick={(e) => toggleSelect(path, e)}
                                    className={`p-0.5 rounded hover:bg-black/5 transition-colors ${isSelected ? "text-teal-600" : "text-slate-300"}`}
                                >
                                    {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                                </button>
                                <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-500" />
                                <span className="text-xs text-slate-600 truncate">{path.replace("/reference/raw/", "")}</span>
                            </div>
                            <button 
                                onClick={(e) => handleDeleteSingle(path, e)}
                                className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>

         {/* Digest Files List */}
         <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Digests</span>
                <span className="bg-slate-100 px-1.5 rounded text-slate-500">{digestFiles.length}</span>
            </h3>
            <div className="space-y-1">
                {digestFiles.length === 0 && <div className="text-xs text-slate-400 italic py-2">Run Sync to generate digests.</div>}
                {digestFiles.map(path => {
                     const isSelected = selectedItems.has(path);
                     return (
                        <div key={path} onClick={() => setSelectedFile(path)} className={`group flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border ${isSelected ? "border-teal-200 bg-teal-50/50" : "border-transparent hover:border-slate-100"}`}>
                            <div className="flex items-center gap-2 overflow-hidden">
                                <button 
                                    onClick={(e) => toggleSelect(path, e)}
                                    className={`p-0.5 rounded hover:bg-black/5 transition-colors ${isSelected ? "text-teal-600" : "text-slate-300"}`}
                                >
                                    {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                                </button>
                                <FileCode className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-500" />
                                <span className="text-xs text-slate-600 truncate">{path.replace("/reference/digests/", "")}</span>
                            </div>
                            <button 
                                onClick={(e) => handleDeleteSingle(path, e)}
                                className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                     )
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [view, setView] = useState<"chat" | "tracker" | "sessions" | "reference">("chat");
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<ApiConfig>(() => {
    try {
        const saved = localStorage.getItem("nmle_api_config");
        return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch(e) { return DEFAULT_CONFIG; }
  });
  const [files, setFiles] = useState<FileSystem>(() => {
    try {
        const saved = localStorage.getItem("nmle_files");
        if (saved) return JSON.parse(saved);
    } catch(e) { }
    return {
      "/progress/nmle-study-tracker.md": INITIAL_TRACKER,
      "/reference/00_INDEX.md": INITIAL_INDEX,
      "manifest.json": INITIAL_MANIFEST
    };
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("nmle_api_config", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem("nmle_files", JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const updateFile = (path: string, content: string) => {
    setFiles(prev => ({ ...prev, [path]: content }));
  };

  const deleteFiles = (paths: string[]) => {
    setFiles(prev => {
        const next = { ...prev };
        paths.forEach(p => delete next[p]);
        return next;
    });
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && input !== "/start") || isLoading) return;
    
    // Auto-open settings if no API key
    if (!config.apiKey) {
        setMessages(prev => [...prev, { role: "model", content: "⚠️ Please configure your API Key in Settings to start." }]);
        setShowSettings(true);
        return;
    }

    const userMsg = input;
    setInput("");
    setIsLoading(true);
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);

    const today = new Date().toISOString().split('T')[0];
    const sessionPath = `/sessions/${today}/session-notes.md`;
    const trackerContent = files["/progress/nmle-study-tracker.md"] || "";
    const indexContent = files["/reference/00_INDEX.md"] || "";
    const sessionContent = files[sessionPath] || "";

    const contextPrompt = `
[SYSTEM STATE]
Current Date: ${today}
Study Tracker:
${trackerContent}

Reference Index:
${indexContent}

Current Session Notes (${today}):
${sessionContent}

USER INPUT: ${userMsg}
`;

    try {
        let responseText = "";
        let finalFiles = { ...files };

        if (config.provider === 'google') {
            const clientOptions: any = { 
                apiKey: config.apiKey, 
            };
            if (config.baseUrl) {
                clientOptions.baseUrl = config.baseUrl;
            }
            const ai = new GoogleGenAI(clientOptions);
            const modelName = config.modelId || 'gemini-3-flash-preview';
            
            const response = await ai.models.generateContent({
                model: modelName,
                contents: { parts: [{ text: contextPrompt }] },
                config: {
                    systemInstruction: SYSTEM_PROMPT,
                    maxOutputTokens: 8192,
                }
            });
            responseText = response.text || "";
        } else {
             const baseUrl = config.baseUrl || "https://api.openai.com/v1";
             const url = baseUrl.endsWith("/") ? `${baseUrl}chat/completions` : `${baseUrl}/chat/completions`;
             const modelName = config.modelId || "gpt-3.5-turbo";
             
             const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        { role: "user", content: contextPrompt }
                    ]
                })
             });
             const data = await res.json();
             if (!res.ok) throw new Error(data.error?.message || "API Error");
             responseText = data.choices?.[0]?.message?.content || "";
        }

        const fileRegex = /---START FILE: (.*?)---\n([\s\S]*?)---END FILE---/g;
        let match;
        while ((match = fileRegex.exec(responseText)) !== null) {
            const path = match[1].trim();
            const content = match[2].trim();
            finalFiles[path] = content;
        }
        
        setFiles(finalFiles);
        setMessages(prev => [...prev, { role: "model", content: responseText }]);

    } catch (e: any) {
        setMessages(prev => [...prev, { role: "model", content: `Error: ${e.message}` }]);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleRefSync = async () => {
     const rawFiles = Object.keys(files).filter(k => k.startsWith("/reference/raw/"));
     const list = rawFiles.map(f => `- ${f.replace("/reference/raw/", "")}`).join("\n");
     const newIndex = `# Reference Index\nLast Sync: ${new Date().toLocaleString()}\n\n${list}`;
     updateFile("/reference/00_INDEX.md", newIndex);
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <div className="w-16 md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 transition-all z-20">
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-800 bg-slate-900">
          <Activity className="w-6 h-6 text-teal-500" />
          <span className="ml-3 font-bold text-white tracking-wider hidden md:block">NMLE Learning OS</span>
        </div>
        
        <div className="flex-1 py-6 space-y-2 px-2 md:px-4 overflow-y-auto">
            <button onClick={() => setView("chat")} className={`w-full flex items-center p-3 rounded-xl transition-all ${view === "chat" ? "bg-teal-600/20 text-teal-400 ring-1 ring-teal-500/50" : "hover:bg-white/5 hover:text-white"}`}>
                <Bot className="w-5 h-5" />
                <span className="ml-3 font-medium hidden md:block">Coach Chat</span>
            </button>
            <button onClick={() => setView("tracker")} className={`w-full flex items-center p-3 rounded-xl transition-all ${view === "tracker" ? "bg-teal-600/20 text-teal-400 ring-1 ring-teal-500/50" : "hover:bg-white/5 hover:text-white"}`}>
                <Activity className="w-5 h-5" />
                <span className="ml-3 font-medium hidden md:block">Study Tracker</span>
            </button>
            <button onClick={() => setView("sessions")} className={`w-full flex items-center p-3 rounded-xl transition-all ${view === "sessions" ? "bg-teal-600/20 text-teal-400 ring-1 ring-teal-500/50" : "hover:bg-white/5 hover:text-white"}`}>
                <History className="w-5 h-5" />
                <span className="ml-3 font-medium hidden md:block">Sessions</span>
            </button>
            <button onClick={() => setView("reference")} className={`w-full flex items-center p-3 rounded-xl transition-all ${view === "reference" ? "bg-teal-600/20 text-teal-400 ring-1 ring-teal-500/50" : "hover:bg-white/5 hover:text-white"}`}>
                <Database className="w-5 h-5" />
                <span className="ml-3 font-medium hidden md:block">Reference</span>
            </button>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
            <button onClick={() => setShowSettings(true)} className="w-full flex items-center p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors group">
                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span className="ml-3 text-sm font-medium hidden md:block">Settings</span>
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-white">
        
        {view === "chat" && (
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0 shadow-sm z-10">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <Bot className="w-5 h-5 text-teal-600" />
                        Clinical Exam Coach
                    </h2>
                    <div className="flex items-center gap-3">
                        <button 
                             onClick={() => {
                                 const confirm = window.confirm("Clear chat history?");
                                 if (confirm) setMessages([]);
                             }}
                             className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                             title="Clear Chat"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${config.apiKey ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${config.apiKey ? "bg-green-500" : "bg-amber-500"}`} />
                            {config.apiKey ? "Online" : "Offline"}
                        </span>
                    </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center">
                                <Bot className="w-10 h-10 text-teal-600/40" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-lg font-semibold text-slate-600">Ready to start your session?</p>
                                <p className="text-sm max-w-xs mx-auto text-slate-400">Review your tracker, check references, or start a new study block.</p>
                            </div>
                            <button onClick={() => setInput("/start")} className="px-6 py-2.5 bg-white border border-slate-200 shadow-sm rounded-full text-xs font-bold text-slate-600 hover:text-teal-600 hover:border-teal-300 hover:shadow-md transition-all">
                                Type <span className="font-mono text-teal-600">/start</span> to begin
                            </button>
                        </div>
                    )}
                    {messages.map((m, i) => (
                        <div key={i} className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
                                m.role === "user" 
                                ? "bg-teal-600 text-white rounded-tr-sm" 
                                : "bg-white text-slate-700 border border-slate-100 rounded-tl-sm"
                            }`}>
                                <div className={`whitespace-pre-wrap text-sm leading-relaxed font-sans ${m.role === "model" ? "prose prose-sm prose-slate max-w-none" : ""}`}>
                                    {m.role === "model" ? <MarkdownView content={m.content} /> : m.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start animate-in fade-in">
                            <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 border border-slate-100 shadow-sm flex items-center gap-2">
                                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-200 z-20">
                    <div className="max-w-4xl mx-auto relative flex items-center gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                            placeholder="Type a message or command..."
                            className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
                            disabled={isLoading}
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={isLoading || (!input.trim() && input !== "/start")}
                            className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-600/20 hover:shadow-teal-600/30"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {view === "tracker" && (
            <FileEditor 
                title="Study Tracker" 
                path="/progress/nmle-study-tracker.md"
                content={files["/progress/nmle-study-tracker.md"] || ""} 
                icon={Activity}
            />
        )}

        {view === "sessions" && (
            <SessionManager 
                files={files} 
                currentDate={new Date().toISOString().split('T')[0]}
                onDelete={deleteFiles}
            />
        )}

        {view === "reference" && (
            <ReferenceManager 
                files={files} 
                onAddFile={updateFile} 
                onSync={handleRefSync}
                onDelete={deleteFiles}
            />
        )}
      </div>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        config={config} 
        onSave={(c) => { setConfig(c); setShowSettings(false); }} 
      />
    </div>
  );
};

export default App;