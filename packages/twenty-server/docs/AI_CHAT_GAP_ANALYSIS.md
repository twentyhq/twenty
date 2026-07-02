# AI Chat vs "ChatGPT-grade" — verified gap analysis

Method: six subsystem readers mapped the code (file:line evidence), every claimed
defect got a refute-first adversarial verification pass for high severity;
medium/low items were verified inline during implementation review. Scores are
against the six-item quality bar. State reflects this branch (which already
fixes several items — noted inline).

## Scorecard

| # | Quality-bar item | Score | One-line justification |
|---|---|---|---|
| 1 | Streaming stability | **degraded** | In-order live streaming is solid (seq'd Redis log + drain-ordered terminal events), but reload/reconnect mid-stream can reorder or drop tokens (below), and a worker hard-crash leaves a permanently "streaming" thread. |
| 2 | Perceived latency | **solid (fixed here)** | Optimistic send existed; the send→first-chunk window had no indicator and no Stop — both added on this branch. TTFT metrics already instrumented server-side. |
| 3 | Interruption & recovery | **degraded** | Stop persists partial output and settles cleanly; typed-error retry works end-to-end (banner gap for partial-output turns fixed here). Recovery holes: stop-before-job-start races, queue stranding after stop, no continue-after-interrupt (proposal doc). |
| 4 | Failure UX completeness | **degraded** | Every throw path now ends in a typed `stream-error` with thread-persisted state (WORKSPACE_NOT_FOUND fixed here; transient errors get one silent retry). Remaining: queue flush erases the failed turn's error; billing-cap invisible to members without billing permission. |
| 5 | Multi-tab/device consistency | **degraded** | Chunks/queue/persist events fan out to all tabs correctly; stream-error does not refetch and the banner gates on last-message-role, so tab B can silently miss a failure; answered questions stay interactive in other tabs until turn end. |
| 6 | Long threads | **acceptable** | No virtualization (plain column), but per-token re-render blast radius is one message (deep-equal per-message sync) and flushes are throttled to 10/s. Markdown fully re-parses per flush — the main jank vector on very long messages. Compaction indicator exists but the marker is never persisted. |

## Confirmed high-severity defects (adversarially verified)

1. **Worker hard-crash bricks the thread** — `aiStreamQueue` has `attempts=1`
   (`bullmq.driver.ts:266`) and only the job's own catch/finally clear
   `activeStreamId` / set `lastStreamError`. A worker killed mid-stream (deploy,
   OOM) leaves `activeStreamId` set forever: every send queues behind a dead
   stream, no error ever renders. Compounding it, the stale Redis chunk list
   (only deleted by `message-persisted` or the next job's `resetStreamState`)
   re-plays on every refetch, flipping the UI to "streaming" with no terminator
   until the 1 h TTL. **Verdict: CONFIRMED (both verifiers).**
2. **Non-atomic stream claim** — `streamAgentChat` enqueues the job *before*
   writing `activeStreamId` (`agent-chat-streaming.service.ts:122-144`); two
   racing sends (or send racing `stopAgentChatStream`'s unguarded clear at
   `agent-chat.resolver.ts:346`) can start two concurrent jobs whose
   `resetStreamState` wipe each other's chunk lists and interleave chunks on
   one thread. **Verdict: CONFIRMED.**
3. **Reload-mid-stream token reordering** — when the SSE subscription attaches
   before the catchup query returns, live chunks (seq N) are written to the
   reader first and catchup then replays 1..N−1 *behind* them
   (`AgentChatMessagesFetchEffect.tsx:113-125` vs
   `useAgentChatSubscription.ts:311-330`): the streamed message renders
   scrambled until the persist refetch. The mirror-image window (query first,
   chunks published before attach) *drops* those chunks — there is no gap
   detection between catchup `maxSeq` and `firstLiveSeq`. **Verdict: verification in flight.**
4. **Silently dead SSE pre-first-chunk** — liveness recovery
   (`AgentChatStreamKeepAliveEffect`) only fires when `isStreaming` is true; a
   socket that died before the first chunk leaves the user on the pending
   indicator with no recovery (server keepalives feed the same timer, so a
   *half*-dead connection also never trips it mid-stream).
   **Verdict: verification in flight.**
5. **Stale catchup replay flips an idle thread to "streaming" forever** — the
   client-side face of #1; replayed chunks set `isStreaming=true`, no
   terminator ever arrives, and each keep-alive-triggered refetch replays them
   again. **Verdict: verification in flight.**

## Confirmed/traced medium defects (selection, by consensus across readers)

- **Queue flush erases the failed turn** (3 readers + inline trace): the job's
  `finally` flushes the next queued message even on the error path; promotion
  clears `lastStreamError` (`agent-chat-streaming.service.ts:399-403`) seconds
  after it was set — the user may never see the error and `retryChatMessage`
  stops matching. Needs a product decision (see backlog #2).
- **Stop strands the queue**: the aborted path skips the only flush site;
  queued messages sit until some later stream completes. A later send also
  jumps ahead of them (FIFO inversion).
- **Send-vs-flush orphan window**: a message queued after the finally's flush
  check stays QUEUED with nothing to flush it.
- **`firstLiveSeq` never resets per turn**: it is per-subscription
  (`useAgentChatSubscription.ts:166`), so a *second* turn's refetch replays
  catchup chunks the reducer already saw live, or suppresses needed gap-fill.
- **stream-error invisible in second tab**: no refetch accompanies the error
  event, and the under-list banner requires the last message to be the user's.
- **Billing-cap invisibility**: `AiChatErrorRenderer` returns null for
  BILLING_CREDITS_EXHAUSTED (delegating to a banner gated on billing
  permission) — members without that permission see nothing at all.
- **ask_questions gaps** (coordinate with #22346 follow-ups): answer-mutation
  rollback restores `activeStreamId` but not the claimed question (answers
  lost); retry deletes the turn's answered question message; marker set +
  persist are non-atomic.
- **Pruning verdict from message-count delta**: `message-pruning.service.ts`
  re-measures nothing after pruning; threads can be falsely bricked as "too
  long" (thrown as raw Error → generic STREAM_EXECUTION_FAILED with a
  pointless Retry) or passed through to a provider 400.
- **data-compaction is pre-`start` and never persisted**: the marker attaches
  to a synthesized client-side message and vanishes on reload.

## Fixed on this branch (with regression tests where marked)

- WORKSPACE_NOT_FOUND early return leaving the thread stuck ✅ (test)
- Retry button missing when the failed turn persisted partial output ✅
- No indicator/Stop between send and first chunk ✅
- One silent auto-retry for transient pre-first-chunk failures ✅ (tests)
- Fetched-messages sync wiping the optimistic user message ✅
- Regression tests for the two historical hangs (execute-throw, onFinish-throw) ✅

## Prioritized backlog (impact × effort × risk)

1. **Stream liveness watchdog (fixes highs #1/#5)** — server-side: a periodic
   sweep (or BullMQ `failed`/`stalled` event hook) that clears `activeStreamId`
   and persists a `STREAM_INTERRUPTED` `lastStreamError` for threads whose
   `activeStreamId` has no live job; also delete the chunk list. Client keeps
   working unchanged (error replays via catchup). Effort ~1–2 d. Low risk.
2. **Queue semantics after failure/stop (fixes queue-erases-error, stop
   stranding, FIFO inversion)** — needs a product call between:
   (a) *fail-fast*: on failure, auto-flush continues (today) but the promoted
   message must NOT clear `lastStreamError` until its own first chunk; or
   (b) *halt-queue*: on failure/stop, don't flush; error banner + queued
   messages stay visible; Retry (or explicit "resume queue") drains. (b)
   matches ChatGPT expectations. Effort ~1–2 d either way.
3. **Seq-exact catchup merge (fixes high #3 + gap-drop + firstLiveSeq
   staleness)** — client-side sequencer: track `lastAppliedSeq` per stream
   epoch; buffer live chunks with `seq > lastApplied+1` until catchup fills the
   gap; detect unfillable gaps → one refetch. Removes the ordering/drop
   windows without server changes. Effort ~2 d incl. reducer tests. Medium risk
   (core streaming path).
4. **Atomic stream claim** — claim `activeStreamId` via conditional UPDATE
   (`WHERE activeStreamId IS NULL`) *before* enqueueing, roll back on enqueue
   failure; make `stopAgentChatStream` clear with a streamId guard. Effort
   ~0.5–1 d.
5. **Pre-first-chunk liveness (fixes high #4)** — extend the keep-alive
   recovery gate to `isStreaming || isAwaitingFirstChunk` with a longer
   timeout (e.g. 20 s) and a bounded number of resubscribe+refetch attempts
   before surfacing a typed connection error. Effort ~0.5 d.
6. **Second-tab error visibility** — publish `queue-updated`-style refetch on
   `stream-error`, drop the last-message-role gate in favour of
   `lastStreamError` presence. Effort ~0.5 d.
7. **Billing-cap visibility for non-billing members** — render a read-only
   "out of credits, contact an admin" banner when the permission gate hides
   the actionable one. Effort ~0.5 d.
8. Longer tail: typed CONTEXT_WINDOW_EXCEEDED (hide Retry, suggest new
   thread), pruning re-measurement, persistent compaction marker,
   ask_questions atomicity/rollback trio, markdown block-level memoized
   rendering, list virtualization, continue-after-interrupt (see proposal doc).
