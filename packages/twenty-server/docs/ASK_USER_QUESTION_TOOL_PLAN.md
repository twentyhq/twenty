# Design Plan — `ask_question` AI Tool (Approach B: true tool-result resume)

> Supersedes the earlier "answer as a user message" sketch. This is the long-term design:
> the user's answer is a **structured tool result bound to the `toolCallId`**, and the **same
> agent turn resumes** — exactly how Anthropic (`tool_result` by `tool_use_id`) and OpenAI
> (`function_call_output` / `submitToolOutputs` by `call_id`) model human-in-the-loop. No
> synthetic free-text user turn.

## 1. Goal & requirements

Let the in-app "Ask AI" assistant **pause and ask the user one or more multiple-choice
questions** (per the Figma design), then continue once answered.

Hard requirements:
- **Harness-only.** The tool is meaningless without a UI to render and collect the answer, so
  it must be **absent** from MCP and from head-less workflow agents — not merely hidden.
- **Durable across refresh.** A pending question is part of the thread; reloading the page
  re-shows it. It must appear **only on its own thread**.
- **Priority over the queue.** While a question is unanswered, the message queue **cannot
  unpile** — new messages pile up behind the question and only drain after it is answered and
  the resumed turn completes.

## 2. The design in one paragraph

`ask_question` is an **inline, chat-only tool with an `execute` that returns a *pending*
result immediately**; `stopWhen` halts the turn right after the call so the model can't answer
itself. Because the tool part is `output-available` (it has a result) it is **immune to
`finalizeDanglingToolParts`** — the one mechanism that makes the textbook "no-execute / dangling
tool call" form of HITL impossible here. A nullable **`pendingQuestion` marker on the thread**
records that the last turn is awaiting an answer; it gates both the send path and the queue
drain. The user answers via a new **`answerAgentChatQuestion` mutation**, which **updates that
same tool part's output** with the structured selection (B's semantics — answer bound to
`toolCallId`), clears the marker, and **re-enqueues the stream job with the paused turn's
`existingTurnId`**. The job rebuilds history from the DB (now the tool result carries the
answer) and `streamText` continues the same turn. On a fresh turn completing with no pending
question, the normal `flushNextQueuedMessage` drains the queue.

This achieves true B semantics **without** weakening the `finalizeDanglingToolParts` safety net
or inventing a fragile new tool-part state.

## 3. Why the obvious forms don't work (verified against the code)

| Form | Why rejected |
|---|---|
| **A — answer as a new user message** | A hack: encodes structured intent as free text, not bound to the call; pollutes the transcript; doesn't generalize to future HITL tools; diverges from how Anthropic/OpenAI model it. |
| **B-naive — tool with no `execute`, left `input-available`** | **Impossible without weakening a safety util.** `finalizeDanglingToolParts` unconditionally rewrites `input-available` → `output-error` "Tool execution was interrupted" on the **persist path** (`agent-chat.service.ts:239`, inside `addMessage`) **and** on the **model-reload path** (`chat-execution.service.ts:285`, before `convertToModelMessages`). The pending state can never survive to the DB, and even if it did it would be corrupted on resume. (Util: `finalize-dangling-tool-parts.util.ts:25-31`.) |
| **B (this plan) — `execute` returns a pending result; answer updates that result** | Part is always `output-available` → finalize leaves it alone. Same model-facing semantics as B-naive, but works with the existing machinery. |

## 4. How the system works today (verified, with refs)

All paths run **server-side**; the frontend uses a GraphQL subscription + Jotai, not ai-sdk's
client `useChat`.

- **Send decision** — `agent-chat.resolver.ts:177` `sendChatMessage`: if
  `thread.activeStreamId` is set → `queueMessage` (status `QUEUED`); else → `streamAgentChat`
  (returns a `streamId`).
- **Turn start** — `agent-chat-streaming.service.ts:63` `streamAgentChat` persists the USER
  message via `agentChatService.addMessage` and enqueues `STREAM_AGENT_CHAT_JOB_NAME`, setting
  `thread.activeStreamId`.
- **The turn** — `stream-agent-chat.job.ts` runs `ChatExecutionService.streamChat`
  (`chat-execution.service.ts:417` `streamText`, tools assembled at `:202-224`, `stopWhen` at
  `:422-423`). Chunks publish live via Redis; on finish `handleStreamFinish` →
  `agentChatService.addMessage({ role: ASSISTANT, parts })` (`stream-agent-chat.job.ts:~522`).
- **Persistence** — `addMessage` (`agent-chat.service.ts:194`) calls
  `finalizeDanglingToolParts(parts)` at **`:239`** then `mapUIMessagePartsToDBParts`. Tool
  part `state` is a varchar (`agent-message-part.entity.ts:~65`); `toolCallId`, `toolInput`,
  `toolOutput` are columns. `AgentMessageStatus` has only `QUEUED` and `SENT` — **no
  "awaiting-input"** state.
- **Queue drain ("unpile")** — job `finally` (`stream-agent-chat.job.ts:~116`) calls
  `flushNextQueuedMessage` (`agent-chat-streaming.service.ts:148`) **unconditionally** (unless
  aborted): it takes the oldest `QUEUED` message, `promoteQueuedMessage`
  (`agent-chat.service.ts:418`, QUEUED→SENT, **new turnId**), and re-enqueues the stream job
  with `existingTurnId`. **This is the single place to gate.**
- **Resume plumbing already exists** — the stream job accepts `existingTurnId`
  (`StreamAgentChatJobData`); queued-message promotion already re-runs a turn **without a new
  user message**. The answer flow reuses this exact path.
- **Frontend** — `AiChatTab` → `AiChatTabMessageList` + `AiChatQueuedMessages` +
  `AiChatEditorSection` (editor at `AiChatEditorSection:159`, model `Select` at `:168`, send at
  `:180`, `StyledInputBox` `:158-186`). Messages load via `AgentChatMessagesFetchEffect`
  (`GetChatMessages`, `:147-156`), splitting `QUEUED` into
  `agentChatQueuedMessagesComponentFamilyState` (keyed by `threadId`). Tool parts rehydrate via
  `mapDBPartToUIMessagePart.ts:67-86` (`type` starting with `tool-`).

## 5. The Figma design (node 105959:117153)

The interactive card **replaces the composer/input area** while a question is pending; the
transcript only shows an **"Asking questions…"** status line. The card (top→bottom):

1. **Question title** + **pager** `‹ 1/2 ›|` (`IconChevronLeft`, `1/N`, `IconChevronRightPipe`)
   when there are multiple questions — pagination is purely client-side over one tool call.
2. **Option rows** — `MenuItem`, each with a number icon (`IconSquareNumber1..9`), the option
   `label`, an optional `· Recommended` subtext, and a right-aligned `IconInfoCircle` button
   whose popover/tooltip shows the option `description`.
3. **Free-text fallback** — the normal composer textbox, placeholder **"Type anything to do
   differently."** — submitting free text *is* an answer (free-form).
4. **Actions row** — `+` / context buttons, the model `Select` ("Mythos"), and the send arrow
   (`IconArrowUp`).

All icons/components exist in `twenty-ui` (`IconSquareNumber1..9`, `IconChevronLeft`,
`IconChevronRightPipe`, `IconInfoCircle`, `IconArrowUp`, `IconPlus`, `MenuItem`, `Select`).

## 6. Data shapes

### 6.1 Shared types — `twenty-shared/src/ai/`
```ts
// AskQuestionToolTypes.ts
export type AskQuestionOption = { label: string; description?: string; isRecommended?: boolean };
export type AskQuestionItem = {
  header: string;            // short chip/tag (≤ ~32 chars)
  question: string;
  options: AskQuestionOption[]; // 2–4
  allowMultiSelect?: boolean;   // default false
};

// Persisted as the tool part's output.result, mutated in place across the lifecycle:
export type AskQuestionToolResult = {
  questions: AskQuestionItem[];
  status: 'pending' | 'answered' | 'skipped';
  answers?: Array<{
    questionIndex: number;
    selectedOptionIndices: number[]; // [] when only free text was used
    freeText?: string;               // "Type anything to do differently."
  }>;
};
```
Export from `twenty-shared/src/ai/index.ts`; rebuild `twenty-shared` first.

### 6.2 Tool part lifecycle (always `output-available`)
- **Pending:** `output = { success: true, message: 'Awaiting user answer', result: { questions, status: 'pending' } }`
- **Answered:** same part/`toolCallId`, `output.result = { questions, status: 'answered', answers }`
- **Skipped (dismiss):** `output.result.status = 'skipped'`

## 7. Backend changes

### 7.1 The tool — chat-only, inline (harness-only by construction)
`ai-chat/tools/ask-question.tool.ts` (factory like `tool-provider/tools/load-skill.tool.ts`):
```ts
export const ASK_QUESTION_TOOL_NAME = 'ask_question';
export const askQuestionInputSchema = z.object({
  questions: z.array(z.object({
    header: z.string(),
    question: z.string(),
    options: z.array(z.object({
      label: z.string(),
      description: z.string().optional(),
      isRecommended: z.boolean().optional(),
    })).min(2).max(4),
    allowMultiSelect: z.boolean().optional(),
  })).min(1).max(4),
});

export const createAskQuestionTool = () => ({
  description:
    'Ask the user one or more multiple-choice questions when a decision cannot be inferred ' +
    'from the request/context and has no obvious default. The conversation pauses until the ' +
    'user answers. Do NOT use it for facts you can look up with other tools.',
  inputSchema: askQuestionInputSchema,
  // Returns a PENDING result immediately so the part is `output-available`
  // (immune to finalizeDanglingToolParts). The model never sees this — the turn halts.
  execute: async (input) => ({
    success: true,
    message: 'Awaiting user answer',
    result: { questions: input.questions, status: 'pending' },
  }),
});
```
Wire into `chat-execution.service.ts` `activeTools` (`:202-224`) — **only here**, never via a
provider/registry → never in MCP, never in workflow agents. Add to `preloadedToolNames` so the
system prompt lists it.

### 7.2 Halt the turn
`chat-execution.service.ts:422` add `hasToolCall(ASK_QUESTION_TOOL_NAME)` (imported from `ai`)
to `stopWhen`. Required: since `execute` returns a result, the loop would otherwise continue;
this halts immediately after the call. On **resume**, the prior call is in the input history,
not in this generation's steps, so `stopWhen` does not re-fire unless the model asks again.

### 7.3 The durable "pending" marker
Add nullable `pendingQuestionMessageId: uuid | null` to `AgentChatThreadEntity` (the assistant
message holding the unanswered question). Generate a **fast instance command**
(`database:migrate:generate --name addThreadPendingQuestion --type fast`, with `up`/`down`).
- **Set** it when a turn halts on `ask_question`: in `handleStreamFinish`
  (`stream-agent-chat.job.ts`), after persisting the assistant message, if any part is a
  `tool-ask_question` with `result.status === 'pending'`, set
  `thread.pendingQuestionMessageId = assistantMessageId` (and leave `activeStreamId` cleared —
  no stream is running while paused).
- **Single source of truth** for "this thread is blocked awaiting an answer." (Alternative with
  zero migration: derive via a `hasPendingQuestion(threadId)` query over the last assistant
  message's parts — simpler to ship, but the column is race-safe and O(1); preferred long-term.)

### 7.4 Gate the send path and the queue drain
Unified predicate **`isBlocked = isDefined(activeStreamId) || isDefined(pendingQuestionMessageId)`**:
- `agent-chat.resolver.ts:177` `sendChatMessage` — queue if `isBlocked` (so new messages pile
  up behind the question).
- `agent-chat-streaming.service.ts` `flushNextQueuedMessage` (`:148`) — **do not promote/drain**
  while `pendingQuestionMessageId` is set. (At drain time `activeStreamId` is already null.)

This satisfies "priority over the queue: it can't unpile until answered."

### 7.5 The answer / resume mutation
`answerAgentChatQuestion(threadId, messageId, toolCallId, answers, modelId?)`
(`agent-chat.resolver.ts`):
1. Verify the thread's `pendingQuestionMessageId === messageId` and the part's
   `result.status === 'pending'` (idempotency/race guard — reject double answers).
2. **Update the existing tool part** (`agent_message_part` row for `toolCallId`):
   `toolOutput.result = { questions, status: 'answered', answers }`. The answer is now a
   structured tool result bound to the call — **B semantics**.
3. Clear `thread.pendingQuestionMessageId`; set a new `activeStreamId`.
4. Enqueue `STREAM_AGENT_CHAT_JOB_NAME` with **`existingTurnId` = the paused assistant message's
   `turnId`** (continue the same turn) and **no new user message**.
5. The job rebuilds history from the DB; the `ask_question` part is `output-available` so
   `finalizeDanglingToolParts` passes it through; `convertToModelMessages` emits
   `assistant(tool_use ask_question)` + `tool_result(answers)`; `streamText` continues. When this
   turn finishes with no pending question, the normal `finally → flushNextQueuedMessage` drains
   the queue.

This is **turn-level** resume (rebuild full history, fresh `streamText`) — not ai-sdk
generator resumption — so the verifier objection about mid-generator resumption does not apply.

### 7.6 Optional "skip/dismiss"
A `dismissAgentChatQuestion` path (or `answers: []` with intent=skip) sets `status: 'skipped'`,
clears the marker, and resumes (or just drains the queue) so a thread is never permanently
stuck.

## 8. Frontend changes

- **Pending-question state** — `agentChatPendingQuestionComponentFamilyState` keyed by
  `{ threadId }` (mirror `agentChatQueuedMessagesComponentFamilyState`), hydrated in
  `AgentChatMessagesFetchEffect` from the loaded messages (last assistant message's
  `tool-ask_question` part with `status === 'pending'`) and updated live from the stream. Keying
  by `threadId` guarantees it shows **only on its own thread** and **survives refresh**.
- **Composer swap** — in `AiChatEditorSection` (around `StyledInputBox` `:158-186`): if the
  current thread has a pending question, render `<AiChatQuestionCard/>` **instead of** the
  editor; else the normal editor. (Mirrors `AiChatQueuedMessages`' `isDefined(currentThread)`
  guard.)
- **`AiChatQuestionCard.tsx`** — implements §5: title + pager (`currentQuestionIndex` in a
  per-thread atom), `MenuItem` option rows with `IconSquareNumber*` + `IconInfoCircle`
  popover (`AppTooltip`/dropdown), the free-text textbox, model `Select`, send. Selecting an
  option (or typing free text) calls the answer hook.
- **Inline status line** — branch `ask_question` in `AiChatAssistantMessageRenderer` /
  `ToolStepRenderer` to a compact "Asking questions…" / "Answered" indicator (not the full
  interactive card).
- **`useSubmitQuestionAnswer` + `submitQuestionAnswer` mutation** — call
  `answerAgentChatQuestion`; optimistic update the part to `status: 'answered'` and clear the
  pending atom; the resumed stream arrives over the existing subscription. The card becomes
  read-only with the chosen option highlighted.

## 9. End-to-end lifecycle

1. Model calls `ask_question([...])` → `execute` returns `status:'pending'` → `stopWhen` halts.
2. Job persists assistant message (tool part `output-available`, `status:'pending'`) and sets
   `thread.pendingQuestionMessageId`. Queue **not** drained (gate).
3. Client renders "Asking questions…" inline and the **card in the composer**. Refresh → state
   re-derived from the persisted part + marker (same thread only).
4. New messages the user sends meanwhile are **queued** (gate), not streamed.
5. User answers → `answerAgentChatQuestion` updates the tool part's output with `answers`,
   clears the marker, re-enqueues with `existingTurnId`.
6. Resumed turn: model sees `tool_result(answers)` and continues. On finish (no pending
   question) → `flushNextQueuedMessage` drains the queue normally.

## 10. Edge cases

- **Multiple questions** — one tool call carries the array; the card paginates (`1/2`); one
  answer mutation submits all answers atomically (one tool result). Matches Figma.
- **Free-text only** — recorded as `freeText` with empty `selectedOptionIndices`.
- **Concurrency / double-answer** — guarded by check-and-clear on `pendingQuestionMessageId`
  and `status === 'pending'`; the second call is a no-op.
- **Abandon / thread switch** — marker persists; card re-shows on return. `dismiss` is the
  escape hatch.
- **Abort** while pending — there's no live stream to abort; only the marker/card exist.
- **Per-thread isolation** — marker on the thread, card atom keyed by `threadId`.

## 11. Why it stays harness-only

`ask_question` is added **only** to `chat-execution.service.ts`'s inline `activeTools`, exactly
like `learn_tools`/`execute_tool`/`load_skills`. It never enters the tool registry/catalog, so
it is invisible to MCP (`get_tool_catalog`/`learn_tools`/`execute_tool`) and to workflow agents
(`getToolsByCategories`). No `MCP_EXCLUDED_TOOL_NAMES` entry needed — absent by construction.

## 12. File-by-file checklist

**twenty-shared**
- `src/ai/types/AskQuestionToolTypes.ts` (+ `index.ts` export).

**twenty-server**
- `ai-chat/tools/ask-question.tool.ts` — factory, name const, zod schema, pending `execute`.
- `ai-chat/services/chat-execution.service.ts` — add to `activeTools`;
  `hasToolCall(ASK_QUESTION_TOOL_NAME)` in `stopWhen`; add to `preloadedToolNames`.
- `ai-chat/constants/chat-system-prompts.const.ts` — when-to-use guidance.
- `entities/agent-chat-thread.entity.ts` — `pendingQuestionMessageId` column **+ fast instance
  command** (`up`/`down`).
- `stream-agent-chat.job.ts` (`handleStreamFinish`) — set the marker when halting on
  `ask_question`.
- `agent-chat-streaming.service.ts` (`flushNextQueuedMessage`) — gate the drain on the marker.
- `agent-chat.resolver.ts` — gate `sendChatMessage`; add `answerAgentChatQuestion`
  (+ optional `dismissAgentChatQuestion`).
- `agent-chat.service.ts` — helper to update a tool part's output by `toolCallId`; marker
  set/clear helpers. **Do not** change `finalizeDanglingToolParts` (B keeps parts
  `output-available`).
- DTOs for the answer mutation; tests (see §13).

**twenty-front**
- `states/agentChatPendingQuestionComponentFamilyState.ts` (+ a `currentQuestionIndex` atom).
- `components/AiChatQuestionCard.tsx` (+ story/test).
- `components/AiChatEditorSection.tsx` — conditional composer swap.
- `components/AgentChatMessagesFetchEffect.tsx` — hydrate pending-question state on load.
- `components/AiChatAssistantMessageRenderer.tsx` / `ToolStepRenderer.tsx` — inline
  "Asking questions…" branch.
- `hooks/useSubmitQuestionAnswer.ts` + `graphql/mutations/submitQuestionAnswer.ts`.
- Run `twenty-front:graphql:generate` (new mutation + thread field).

## 13. Tests & gates
- **Server unit:** `ask_question` `execute` returns `status:'pending'` and validates min/max
  options; `stopWhen` halts on the call; `finalizeDanglingToolParts` leaves an
  `output-available` `ask_question` part untouched; answer mutation updates the part + clears
  the marker; **MCP/workflow exclusion** regression (registry/catalog never contains
  `ask_question`); queue-gate (no drain while marker set; drain after answer); idempotent
  double-answer.
- **Server integration:** ask → persist → refresh-equivalent reload → answer → resume continues
  same turn → queue drains.
- **Front unit/Storybook:** `AiChatQuestionCard` renders questions/options/descriptions/
  recommended/pagination/free-text; composer swap; answered → read-only; per-thread isolation.
- **Gates:** `lint:diff-with-main`, `typecheck` (front+server), `graphql:generate`.

## 14. Alternatives considered
- **A (answer as user message):** rejected — a hack; not bound to the call; doesn't generalize.
- **B-naive (no-execute / `input-available`):** rejected — corrupted by
  `finalizeDanglingToolParts` on persist and reload; would require weakening a load-bearing
  safety util and inventing a fragile pending part state.
- **B (this plan):** `execute` returns a pending result (always `output-available`); answer
  updates that result; resume via existing `existingTurnId` plumbing. Same platform-aligned
  semantics as B-naive, but works with the machinery and touches no shared safety util.
