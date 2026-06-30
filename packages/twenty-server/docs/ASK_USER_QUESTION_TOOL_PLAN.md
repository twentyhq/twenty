# Design Plan — `ask_question` AI Tool (clarifying multiple‑choice questions)

## 1. Goal

Add a tool that lets the in‑app AI assistant ("Ask AI") **pause and ask the user one
or more multiple‑choice questions** instead of guessing, exactly like the attached
screenshot:

- One or more questions, paginated (`1/2`, `2/2`, …).
- Each question has a short title and 2–4 numbered options.
- Each option has a **label** and an optional **description** revealed via an `i` info icon.
- An option may be flagged **Recommended**.
- A free‑text fallback ("Type anything to do differently").
- The user's choice(s) flow back into the conversation and the assistant continues.

The tool is **harness‑relevant only**: it has no meaning outside the in‑app chat UI that
renders the cards and collects the answer. It must therefore be available **only** in the
in‑app chat path and **must not** be exposed to:

- the **MCP** server/API (external clients can't render or answer the cards), nor
- **workflow agents** (`AgentAsyncExecutorService`, which run head‑less with no user present).

---

## 2. How the AI chat works today (verified)

### 2.1 The tool contract

`packages/twenty-server/src/engine/core-modules/tool/types/tool.type.ts`

```ts
export type Tool = {
  description: string;
  inputSchema: FlexibleSchema<unknown>;
  execute(input: ToolInput, context: ToolExecutionContext): Promise<ToolOutput>;
  flag?: PermissionFlagType;
};
```

`execute` is **mandatory**. `ToolOutput` is `{ success, message, result?, error?, … }`
(`tool-output.type.ts`).

### 2.2 Two execution paths, two tool sets

| Path | Entry | Tool set source | User present? |
|------|-------|-----------------|---------------|
| **In‑app chat** ("Ask AI") | `ai-chat/services/chat-execution.service.ts` → `streamText` | preloaded registry tools + native tools + **inline meta‑tools** (`learn_tools`, `execute_tool`, `load_skills`) | **yes** |
| **Workflow agent** | `ai-agent-execution/services/agent-async-executor.service.ts` → `generateText` | `toolRegistry.getToolsByCategories(WORKFLOW_AGENT_REGISTRY_TOOL_CATEGORIES)` | **no** |
| **MCP** | `engine/api/mcp/services/mcp-protocol.service.ts` → `buildMcpToolSet()` | registry catalog via `get_tool_catalog`/`learn_tools`/`execute_tool`, filtered by `MCP_EXCLUDED_TOOL_NAMES` | external client |

Key insight — in `chat-execution.service.ts` the directly callable, chat‑only tools are
assembled inline and **never go through the registry**:

```ts
const activeTools: ToolSet = {
  ...directTools, // preloaded registry tools + native tools
  [LEARN_TOOLS_TOOL_NAME]: createLearnToolsTool(this.toolRegistry, toolContext),
  [EXECUTE_TOOL_TOOL_NAME]: createExecuteToolTool(this.toolRegistry, toolContext, { … }),
  [LOAD_SKILL_TOOL_NAME]: createLoadSkillTool(…),
};
```

These inline factory tools (`tool-provider/tools/load-skill.tool.ts` is the template) are:
not in any provider, not in the catalog, not reachable by MCP's `execute_tool`, and not in
any `ToolCategory` consumed by workflow agents. **This is the natural, leak‑proof home for a
harness‑only tool.**

### 2.3 The turn model — fully request/response, no built‑in mid‑turn pause

A turn is: user sends a message (`useAgentChat.ts` → `sendChatMessage` mutation) → the
backend runs the **entire** agent loop server‑side (`streamText`, `stopWhen:
stepCountIs(MAX_STEPS=300) || hasNoMoreAvailableCredits`) → parts stream back over a GraphQL
subscription (`useAgentChatSubscription.ts`, `readUIMessageStream`) and are persisted as
`agent-message-part` rows. There is **no** `addToolResult` / human‑in‑the‑loop resume, and
the frontend does **not** use the ai‑sdk `useChat` transport.

Tools with an `execute` run automatically inside that loop; after a tool result the model
keeps going until `stopWhen` is satisfied.

### 2.4 Why a "tool without `execute`" (textbook ai‑sdk HITL) does NOT work here

`ai-agent-execution/utils/finalize-dangling-tool-parts.util.ts` rewrites any tool part left
in `input-available` state (a call with no result) into:

```ts
{ ...part, state: 'output-error', errorText: 'Tool execution was interrupted.' }
```

So a pending, result‑less tool call would be poisoned into an **error** on the next turn.
⇒ The question tool **must** return a real `ToolOutput` from `execute`, and the turn must be
stopped explicitly so the model waits for the user.

### 2.5 The closest existing analog — `navigate_app`

`navigate_app` (`tool/tools/navigate-tool/navigate-app-tool.ts`) is a server tool whose
**output is interpreted by the frontend** to perform a client‑side action (navigation), via
`useProcessUIToolCallMessage.ts`. It proves the "server tool → structured output → client
acts" pattern. The question tool is the **two‑way** version of this: server tool → render
cards → user answers → answer re‑enters the conversation.

### 2.6 Where tool calls render on the frontend

`AiChatAssistantMessageRenderer.tsx` → `MessagePartRenderer` switches on `part.type`; the
default branch sends every tool UI part to the generic `ToolStepRenderer.tsx` (a collapsible
input/output JSON card). This switch is the single branch point for a custom renderer. Tool
parts persist/rehydrate generically (`mapDBPartToUIMessagePart.ts` `tool-${string}` case), so
a custom card survives reload.

---

## 3. Chosen design

**Server‑side tool _with_ `execute` that echoes the questions, turn stopped via `stopWhen`,
answer returned as the next user message.** Wired inline into the chat path only.

### 3.1 Turn lifecycle

1. Model calls `ask_question({ questions: [...] })`.
2. `execute` validates the input and returns `{ success: true, message: 'Waiting for the
   user to answer', result: { questions } }` (a pass‑through echo — no side effects).
3. `streamText`'s `stopWhen` gains `hasToolCall('ask_question')`, so the loop **ends** on the
   step that produced the call — the model cannot answer its own question.
4. The tool‑call + tool‑result parts stream to the client and persist. The frontend renders
   the interactive question card (from `part.input.questions`).
5. The user picks option(s) and/or types free text and submits.
6. The frontend sends the answer as a **normal user message** through the existing
   `sendChatMessage` flow, formatted so the model can map answer→question, e.g.

   ```
   [Answers to your questions]
   1. What type of emails would you like to send? → A welcome email
   2. Tone? → Friendly
   ```

7. A new turn runs; the model sees its prior `ask_question` result plus the user's answer and
   continues. No backend resume machinery required.

This reuses the request/response turn model verbatim — the only new backend behaviors are
"define the tool" and "stop the loop when it's called".

### 3.2 Why this over the alternatives

| Approach | Verdict |
|----------|---------|
| **Inline chat‑only tool + `stopWhen` + answer‑as‑user‑message** (this plan) | ✅ Smallest change; leak‑proof (never in registry/MCP/workflow); no new mutation; survives `finalizeDanglingToolParts`. |
| Register as a normal `ACTION` provider tool + add to `COMMON_PRELOAD_TOOLS` | ❌ Leaks: `ACTION` is in `WORKFLOW_AGENT_REGISTRY_TOOL_CATEGORIES` (workflow agents) **and** in the MCP catalog. Would require adding it to `MCP_EXCLUDED_TOOL_NAMES` **and** to the workflow `excludeTools` list — two easy‑to‑forget guards. More surface, more risk. |
| True ai‑sdk HITL (tool w/o `execute` + `addToolResult` + resume) | ❌ Not supported by this codebase: no `useChat` transport, no resume endpoint, and `finalizeDanglingToolParts` turns the pending call into an error. Large, invasive change. |

---

## 4. Implementation plan

### 4.1 Shared types — `packages/twenty-shared/src/ai/`

Mirror `NavigateAppToolOutput.ts`. Add a single source of truth for the tool's shape, used by
both server and front.

- `types/AskQuestionToolTypes.ts`:

  ```ts
  export type AskQuestionOption = {
    label: string;            // shown on the card
    description?: string;     // revealed via the `i` info icon
    isRecommended?: boolean;  // renders the "Recommended" badge
  };

  export type AskQuestionItem = {
    header: string;           // short chip/tag, e.g. "Email type"
    question: string;         // full question text
    options: AskQuestionOption[]; // 2–4
    allowMultiSelect?: boolean;   // default false
  };

  // Echoed back by execute() as ToolOutput.result
  export type AskQuestionToolOutput = { questions: AskQuestionItem[] };
  ```

- Export from `packages/twenty-shared/src/ai/index.ts`.
- Rebuild: `npx nx build twenty-shared` (twenty‑shared must build before front/server).

### 4.2 Backend — the tool factory (chat‑only, inline)

Create `ai-chat/tools/ask-question.tool.ts` (sibling of the inline `tool-provider/tools/*`
factories; placing it under `ai-chat` underlines that it is chat‑only):

```ts
export const ASK_QUESTION_TOOL_NAME = 'ask_question';

export const askQuestionInputSchema = z.object({
  questions: z.array(z.object({
    header: z.string().describe('Short label/tag for the question (≤ ~12 chars).'),
    question: z.string().describe('The full question to ask the user.'),
    options: z.array(z.object({
      label: z.string().describe('Concise option the user can pick.'),
      description: z.string().optional().describe('Longer explanation shown on the info icon.'),
      isRecommended: z.boolean().optional().describe('Mark the suggested option.'),
    })).min(2).max(4),
    allowMultiSelect: z.boolean().optional(),
  })).min(1).max(4),
});

export const createAskQuestionTool = () => ({
  description:
    'Ask the user one or more multiple-choice questions when you need a decision that ' +
    'you cannot infer from the request or context. The conversation pauses until the user ' +
    'answers. Prefer this over guessing. Do NOT use it for information you can look up with ' +
    'other tools, or for choices that have an obvious default.',
  inputSchema: askQuestionInputSchema,
  execute: async (input: AskQuestionInput): Promise<ToolOutput<AskQuestionToolOutput>> => ({
    success: true,
    message: 'Question presented to the user; waiting for their answer.',
    result: { questions: input.questions },
  }),
});
```

No NestJS provider, no `tool.module.ts` entry, no `ToolCategory` — it lives only where it is
wired in.

### 4.3 Backend — wire into the chat path

`ai-chat/services/chat-execution.service.ts`:

1. Add to the inline `activeTools` map:

   ```ts
   [ASK_QUESTION_TOOL_NAME]: createAskQuestionTool(),
   ```

2. Stop the turn when it's called (import `hasToolCall` from `ai`):

   ```ts
   stopWhen: (step) =>
     stepCountIs(AGENT_CONFIG.MAX_STEPS)(step) ||
     hasToolCall(ASK_QUESTION_TOOL_NAME)(step) ||
     hasNoMoreAvailableCredits,
   ```

3. Add it to `preloadedToolNames` so the system‑prompt "Available Tools" section lists it as
   ready‑to‑use (it's passed in `tools`, so the model already gets the schema; this just makes
   the prompt accurate).

### 4.4 Backend — system‑prompt guidance

`ai-chat/constants/chat-system-prompts.const.ts` — add a short section to `BASE` telling the
model **when** to reach for `ask_question` (ambiguous, consequential, not inferable, no obvious
default) and when **not** to (info it can fetch; trivial defaults), so it doesn't over‑ask.

### 4.5 Backend — persistence & guards (mostly no‑ops, verify)

- Persistence: the call+result persist as a generic tool part — **no schema change**.
- `finalizeDanglingToolParts`: not triggered because `execute` returns a real result.
- Confirm `ask_question` is absent from MCP and workflow sets (it is, by construction). Add a
  regression test asserting `buildMcpToolSet()` / workflow category tools never contain
  `ask_question`.

### 4.6 Frontend — shared input type

Reuse the `twenty-shared/ai` types from §4.1 on the front (already imported elsewhere, e.g.
`ExtendedUIMessage`).

### 4.7 Frontend — the interactive card component

Create `ai/components/AskQuestionCard.tsx`:

- Props: `toolPart` (read `toolPart.input.questions`), plus `toolCallId`, an `isAnswered`
  flag, and a `disabled` flag (true while a later message exists / streaming).
- UI to match the screenshot: question title + `header` chip, pagination (`1/2`) when
  `questions.length > 1`, numbered option rows, `i` info icon → tooltip/popover with
  `option.description`, a "Recommended" badge for `isRecommended`, and a
  "Type anything to do differently" text input.
- Use existing primitives (`twenty-ui` buttons/inputs/tooltip; Lingui `useLingui` for strings).
- Local selection state; on submit, build the consolidated answer string and dispatch the
  existing send flow (§4.9). After submission (or once a newer message exists) render the card
  read‑only with the chosen option highlighted.
- Persist "answered" per `toolCallId` so it stays disabled after reload — reuse the pattern in
  `states/processedToolExecutionPartIdsComponentState` (already used by
  `useProcessUIToolCallMessage`). Even without it, the card is naturally disabled because a
  later user message exists in the thread.

### 4.8 Frontend — dispatch to the custom renderer

`ai/components/AiChatAssistantMessageRenderer.tsx`, in `MessagePartRenderer`, before the
generic `ToolStepRenderer` fallback:

```ts
if (isToolUIPart(part) && getToolName(part) === ASK_QUESTION_TOOL_NAME) {
  return <AskQuestionCard toolPart={part} isStreaming={isStreaming} />;
}
```

(Optionally register an icon/label in `utils/getToolIcon` and the tool‑display utilities for
consistency in any collapsed view.)

### 4.9 Frontend — return the answer

No new mutation. On submit, reuse the existing send path used by `useAgentChat.handleSendMessage`
(set the chat input / dispatch `AGENT_CHAT_SEND_MESSAGE_EVENT_NAME`, or call a small wrapper
hook that invokes `sendChatMessage` with the formatted answer text). This starts a normal new
turn that the backend already handles.

Future enhancement (optional, not required for v1): attach lightweight metadata to the user
message (answered `toolCallId`, selected indices) so the card can render the precise selection
deterministically and the model gets a cleaner signal. v1 can infer "answered" from card state
+ presence of a following user message.

### 4.10 i18n, tests, quality gates

- Wrap all new UI strings in Lingui macros.
- Tests:
  - Server unit: `execute` echoes input & validates (min/max options); `stopWhen` halts on
    `ask_question`; MCP/workflow exclusion regression test.
  - Front unit/Storybook: `AskQuestionCard` renders questions/options/descriptions/recommended,
    pagination, free‑text; submit fires the send flow; answered → disabled.
- Gates: `npx nx lint:diff-with-main twenty-server|twenty-front`,
  `npx nx typecheck twenty-server|twenty-front`,
  `npx nx run twenty-front:graphql:generate` only if any GraphQL changed (this plan adds none).

---

## 5. File‑by‑file checklist

**twenty-shared**
- `src/ai/types/AskQuestionToolTypes.ts` (new) + export in `src/ai/index.ts`.

**twenty-server**
- `ai-chat/tools/ask-question.tool.ts` (new) — factory, name const, zod schema.
- `ai-chat/services/chat-execution.service.ts` — add to `activeTools`; add
  `hasToolCall(ASK_QUESTION_TOOL_NAME)` to `stopWhen`; add to `preloadedToolNames`.
- `ai-chat/constants/chat-system-prompts.const.ts` — usage guidance.
- Tests for the above (+ MCP/workflow exclusion regression test).
- *Not touched:* tool registry, providers, `tool.module.ts`, MCP service, workflow executor,
  message‑part entity/DTO.

**twenty-front**
- `ai/components/AskQuestionCard.tsx` (new) + story/test.
- `ai/components/AiChatAssistantMessageRenderer.tsx` — dispatch to the card.
- A small submit hook (or reuse `useAgentChat` send flow).
- Optional: `utils/getToolIcon` / tool‑display label for `ask_question`.

---

## 6. Edge cases & open questions

1. **Over‑asking** — mitigated by the system‑prompt guidance (§4.4); tune wording during review.
2. **User ignores the card and types something else** — fine: it's just the next user message;
   the model adapts. The card becomes read‑only once a later message exists.
3. **Multi‑select & multiple questions** — schema supports both; v1 collects all answers into one
   consolidated message on submit.
4. **`MAX_STEPS` / mid‑task asks** — `hasToolCall` stops cleanly mid‑loop; resuming is just the
   next turn, so long tool chains that need a mid‑way decision work.
5. **Streaming/abort while a card is pending** — card renders from the persisted part; the
   existing keepalive/abort handling is unaffected.
6. **Persisting exact selection** — v1 infers answered‑state on the client; §4.9 future
   enhancement makes it deterministic if desired.
7. **Decision needed:** confirm the answer should re‑enter as a **user message** (recommended,
   zero new infra) vs. investing in a true tool‑result resume path (larger change). This is the
   one product/architecture call worth confirming before coding.

---

## 7. Summary

The harness‑only nature is satisfied **by construction**: define `ask_question` as an inline
factory tool injected solely into the in‑app chat's `activeTools`, exactly like
`learn_tools`/`execute_tool`/`load_skills`. It never enters the registry, so it is invisible to
MCP and to workflow agents — no exclusion lists to maintain. The interaction model fits the
existing request/response turns: `execute` echoes the questions, `stopWhen` halts the turn so the
model waits, the frontend renders an interactive card, and the user's choice returns as the next
message to continue the conversation.
