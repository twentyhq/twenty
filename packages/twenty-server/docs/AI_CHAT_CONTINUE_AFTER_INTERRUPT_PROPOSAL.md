# Proposal: Continue-after-interrupt for AI chat (design only — not implemented)

## Problem

Stopping a stream (user stop, tab close mid-stream, worker death) persists the
partial assistant message and ends the turn. The only recovery today is
`retryChatMessage`, which *discards* the partial output and regenerates the
whole turn. ChatGPT offers "continue generating": resume the same assistant
message from where it stopped, keeping the tokens already paid for.

## Why this needs per-provider design

Resuming mid-message means asking the model to complete an assistant message
it already started. The provider semantics differ:

- **Anthropic**: native assistant prefill — send the conversation with a final
  `assistant` message containing the partial text; the model continues that
  message. Constraint: prefill must not end with trailing whitespace; not
  compatible with extended thinking blocks that were cut mid-way (interrupted
  reasoning cannot be resumed — the reasoning part must be dropped and only
  text/tool parts kept).
- **OpenAI (Responses/Chat Completions)**: no first-class prefill. The
  standard emulation is a trailing assistant message plus an instruction to
  continue without repeating; models frequently restart the sentence or
  re-introduce. Quality is provider- and model-dependent.
- **Google (Gemini)**: supports a trailing `model` turn similar to prefill,
  with similar whitespace caveats.

The AI SDK (`ai@6`) does not abstract this: `convertToModelMessages` will emit
a trailing assistant message, but whether the provider *continues* it or
*answers after it* is provider-specific. Anthropic continues; OpenAI treats it
as a completed turn.

## Proposed design

1. **Capability flag per model**: `supportsAssistantContinuation` on
   `AiModelConfig` (true for anthropic sdkPackage, false otherwise initially).
   UI shows "Continue" next to "Retry" only when the flag is set and the last
   assistant message ends in a `text` part (not a tool call, not reasoning).
2. **Server**: `continueChatMessage(threadId)` mutation, guarded like
   `retryChatMessage` but requiring an *aborted* rather than failed last turn.
   We persist `lastStopReason: 'aborted' | 'error'` alongside the existing
   thread state when a stream ends (one nullable varchar; the abort path in
   `stream-agent-chat.job.ts` currently records nothing).
3. **Job**: a `continuationOfMessageId` field on `StreamAgentChatJobData`.
   `chat-execution.service.ts` appends the partial assistant message as the
   final model message (trimming trailing whitespace, dropping interrupted
   reasoning/tool parts) and streams the continuation.
4. **Merge on finish**: `handleStreamFinish` appends the continuation's parts
   onto the *existing* assistant message row (same `messageId`,
   `orderIndex += n`) instead of inserting a new message, so the transcript
   shows one seamless message. The client already rebuilds from
   `message-persisted` + refetch, so no client protocol change is needed;
   live rendering shows the continuation as a streaming update to the same
   message id (the mid-stream adapter already tolerates attaching to an
   existing message id).
5. **Token accounting**: continuation is a normal turn for billing; usage
   accumulates on the same turn row.

## Open questions (need product/owner input)

- Is OpenAI-quality "continue" (emulated, may repeat itself) acceptable, or
  should the button be Anthropic-only at launch? (Proposal: Anthropic-only.)
- Should "Continue" survive `data-compaction`? Pruning may have dropped the
  partial message's context; proposal: hide Continue if the turn was pruned.
- Interaction with the message queue: a queued message and "Continue" both
  want the next slot. Proposal: Continue jumps the queue (it is completing the
  *current* turn, not starting a new one).

## Effort estimate

Server (mutation + job field + merge-on-finish + stop-reason column + fast
instance command): ~2 days. Client (button + state): ~1 day. Provider quality
validation across anthropic/openai/google: ~1 day. Total ≈ 4 focused days.
