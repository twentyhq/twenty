# AI Chat Streaming — Event Lifecycle & Architecture

State of the world on `claude/ai-chat-experience-hardening-37zwwl`, which merges
PR #22434 (typed error channel + retry) and PR #22346 (`ask_questions`). All
file:line references are into this tree.

## Components

| Layer | File | Role |
|---|---|---|
| Resolver | `ai-chat/resolvers/agent-chat.resolver.ts` | sendChatMessage:140, retryChatMessage:232, answerAgentChatQuestion:268, stopAgentChatStream:340, chatStreamCatchupChunks:102 |
| Enqueue service | `ai-chat/services/agent-chat-streaming.service.ts` | streamAgentChat:64, retryLastFailedTurn:149, enqueueResumeStream:245, flushNextQueuedMessage:290 |
| Job | `ai-chat/jobs/stream-agent-chat.job.ts` | BullMQ worker on `aiStreamQueue` (concurrency 20, lock 10 min — `message-queue-worker-options.constant.ts:8`, attempts = 1 — `bullmq.driver.ts:266`) |
| Publisher | `ai-chat/services/agent-chat-event-publisher.service.ts` | Redis chunk list + SSE publish |
| Subscription | `ai-chat/resolvers/agent-chat-subscription.resolver.ts` | per-thread graphql-sse subscription, keepalive heartbeat (initial value + interval, :68–87) |
| Execution | `ai-chat/services/chat-execution.service.ts` | streamText call: tools, pruning, billing (:116–617) |
| Client transport | `twenty-front/modules/sse-db-event/components/SSEClientEffect.tsx` | graphql-sse client, `retryAttempts: Infinity`, dispatches `SSE_CLIENT_RECONNECTED` |
| Client live reducer | `twenty-front/modules/ai/hooks/useAgentChatSubscription.ts` | event switch (:293), mid-stream adapter (:40), 100 ms flush throttle (:34) |
| Client fetch/catchup | `twenty-front/modules/ai/components/AgentChatMessagesFetchEffect.tsx` | GetChatMessages + catchup replay (:113–134) |
| Client send | `twenty-front/modules/ai/hooks/useAgentChat.ts` | optimistic user message, error/awaiting state resets |

## Send → tokens on screen

1. **Send** (`useAgentChat.handleSendMessage`): optimistic user message appended
   to the per-thread `messages` atom, error atom cleared, awaiting-first-chunk
   flag set; `sendChatMessage` mutation fired.
2. **Resolver gate** (`agent-chat.resolver.ts:191`): if `thread.activeStreamId`
   or `thread.pendingQuestionMessageId` is set, the message is persisted as
   QUEUED (`queueMessage`) and a `queue-updated` event is published; otherwise
   `streamAgentChat` runs.
3. **Enqueue** (`agent-chat-streaming.service.ts:64`): persists the user
   message (+turn), loads DB history, enqueues `StreamAgentChatJob` with a fresh
   `streamId`, then sets `activeStreamId = streamId` and clears
   `lastStreamError` (:139–144). Note the job is enqueued *before* the claim is
   written — see "Known races".
4. **Job start** (`stream-agent-chat.job.ts:68`): `resetStreamState` deletes the
   thread's Redis chunk list (:69) so a failed prior turn's chunks never replay.
   Cancel pub/sub subscription is registered (:76), then the workspace is
   loaded *inside* the try — a missing workspace throws
   `AiException(WORKSPACE_NOT_FOUND)` and takes the standard failure path.
5. **Stream build** (`buildAndPublishStream:195`): `createUIMessageStream`
   wraps `chatExecutionService.streamChat` (model call). Two error funnels:
   - errors thrown before the model stream merges → `createUIMessageStream`'s
     `onError` (:339) — sets `streamError`, resolves `streamFinishedPromise`;
   - mid-stream provider errors → `toUIMessageStream`'s `onError` (:285) —
     sets `streamError`; the SDK then emits an opaque `error` chunk.
6. **Publish loop** (:351): every chunk is RPUSHed to
   `agent-chat-stream-chunks:{threadId}` (seq = new list length, 1-based, TTL
   3600 s — `agent-chat-event-publisher.service.ts:37`) and published over SSE
   with that `seq`. `error`-typed chunks are skipped (:352) — the typed
   `stream-error` event is the only error channel.
7. **Finish** (`toUIMessageStream.onFinish` → `handleStreamFinish:485`): after
   the response completes, the assistant message is persisted (idempotent per
   stream via `assistantMessageId = uuidv5(streamId)` and `hasMessageById`),
   usage totals are written, `lastStreamError` cleared, and
   `pendingQuestionMessageId` set iff the turn paused on `ask_questions`.
   `resolveStreamFinished` gates the publish loop.
8. **Terminal event** (after all chunks drained + finish resolved, :366–392):
   - error → `reject(streamError)` (drain-ordered; never races trailing chunks),
   - credits gone → `credits-exhausted`,
   - success → `message-persisted` (which also deletes the Redis chunk list —
     publisher :41–44).
9. **Failure handling** (`handle` catch, :91): `mapErrorToStreamError` →
   `lastStreamError` persisted on the thread ({code,message,failedAt}), typed
   `stream-error` published, error rethrown (job fails, attempts=1 → no re-run).
10. **Finally** (:126): cancel unsubscription; `activeStreamId` cleared with a
    guard (`{ id, activeStreamId: data.streamId }` → no-op if a newer stream
    claimed the thread); if not aborted, `flushNextQueuedMessage` promotes the
    next QUEUED message (which starts a new stream with a fresh `streamId` and
    clears `lastStreamError` — see "Known gaps").

## Client: live reducer

`useAgentChatSubscription` subscribes per thread (torn down on thread switch or
`resubscribeNonce` bump). Events (:293):

- `stream-chunk`: first chunk records `firstLiveSeq` (dedupe boundary for
  catchup), clears awaiting-first-chunk, lazily creates a
  `TransformStream` bridge → mid-stream adapter → `readUIMessageStream` read
  loop. The adapter (:40) synthesizes `start`/`text-start`/... chunks when
  attaching mid-stream. Message flushes to the Jotai atom are throttled to one
  per 100 ms (:34) — the per-token render blast radius is bounded by
  `AgentChatStreamingPartsDiffSyncEffect`'s deep-equal per-message diffing.
- `message-persisted`: closes the writer, sets awaiting-persisted-refetch, and
  triggers a GetChatMessages refetch; the fetched-messages → messages sync
  (`AgentChatStreamSubscriptionEffect.tsx:83`) is suppressed while streaming or
  awaiting the refetch, so the streamed message never flashes.
- `stream-error`: sets the per-thread error atom ({message, code}), stops the
  stream state.
- `credits-exhausted`: same + flips the workspace billing cap state.
- `keepalive`: heartbeat only (feeds `agentChatStreamLastEventTimestampState`).

**Liveness**: `AgentChatStreamKeepAliveEffect` checks every 2 s; if a stream is
marked live but no event (incl. keepalive) arrived for 5 s, it bumps the
resubscribe nonce (fresh subscription, `firstLiveSeq` reset) and refetches —
recovering from silently dead SSE sockets. `SSE_CLIENT_RECONNECTED` triggers
the same recovery.

## Client: reload / reconnect catchup

`AgentChatMessagesFetchEffect.handleDataLoaded` (:78) applies, per refetch:

1. fetched messages split into sent/queued atoms;
2. catchup chunks replayed **only while `seq < firstLiveSeq`** (:113–125) —
   chunks already seen live are never replayed;
3. the persisted `lastStreamError` replayed as a synthetic `stream-error`
   **only when no live chunk has arrived** (`firstLiveSeq === null`, :128) — an
   error from a finished turn never fires into a healthy new stream.

Because a stream that ends in error keeps its Redis chunks (only
`message-persisted` and the next job's `resetStreamState` delete them), a
reload after failure replays partial chunks + the persisted error. After the
1 h TTL the chunks are gone but messages (DB) and `lastStreamError` (thread
row) survive — the UI shows the transcript + error banner, no spinner.

## Stop / cancel

`stopAgentChatStream` (:340) publishes `cancel` on
`ai-stream:cancel:{threadId}` and clears `activeStreamId` unguarded. The job's
cancel subscriber aborts the in-flight model call; `onFinish` runs with
`isAborted` and persists any partial output; the drain publishes
`message-persisted`, so clients settle cleanly. Aborted jobs skip
`flushNextQueuedMessage` (:135) — see "Known gaps".

## Retry

`retryChatMessage` (:232) → `retryLastFailedTurn` (:149): requires
`lastStreamError` set and no active stream; deletes the failed turn's assistant
messages, re-enqueues the same `turnId` with a fresh `streamId` (fresh
`assistantMessageId`), clears `lastStreamError`. Client-side
(`useRetryChatMessage`) optimistically clears the error atom and restores it if
the mutation fails.

## ask_questions pause/resume

The turn stops via `stopWhen: hasToolCall('ask_questions')`
(`chat-execution.service.ts:429`); the tool's `execute` returns a
`status: 'pending'` result immediately so `finalizeDanglingToolParts` never
rewrites it. `handleStreamFinish` sets `pendingQuestionMessageId`;
`sendChatMessage` and `flushNextQueuedMessage` both treat it as blocking.
`answerAgentChatQuestion` (:268) claims the question atomically
(`resolvePendingQuestion`), writes the answers onto the tool part, and resumes
the same turn via `enqueueResumeStream` (`isResume: true` bypasses per-turn
dedup).

## Known races and gaps (verified; see gap analysis for priorities)

- **Non-atomic stream claim**: `streamAgentChat` enqueues the job before
  writing `activeStreamId`; two racing sends can both pass the resolver gate
  and start two jobs whose `resetStreamState` wipes each other's chunk lists.
  The same window exists between `stopAgentChatStream`'s unguarded clear and
  the still-draining job.
- **Queue flush erases the failed turn's error**: `flushNextQueuedMessage` runs
  in the job's `finally` even on the error path; promoting the next queued
  message clears `lastStreamError` (:401) seconds after it was set, so the user
  may never see the failure and `retryChatMessage` stops matching.
- **Stop strands the queue**: the aborted path never flushes; queued messages
  sit until the *next* manually started stream finishes.
- **Send-vs-flush orphan**: a message queued in the window after the finally's
  flush check leaves it QUEUED with no active stream to flush it.
- **Catchup ordering hazard**: if the SSE subscription attaches before the
  catchup query lands, live chunks (seq N) are written to the reader before
  catchup replays 1..N−1 — token reordering until the persisted refetch; if the
  query lands first and chunks are published between the query snapshot and
  subscription attach, those chunks are dropped for the session (no gap
  detection on `firstLiveSeq` vs catchup `maxSeq`).
- **Worker hard-crash mid-stream**: attempts=1 means no re-run; the thread
  stays "streaming" until the 10-min lock expires and nothing clears
  `activeStreamId` or sets `lastStreamError` — sends queue forever.
