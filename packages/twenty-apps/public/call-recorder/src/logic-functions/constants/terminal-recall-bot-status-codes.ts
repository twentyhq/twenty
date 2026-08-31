// Recall rejects DELETE and leave_call once a bot reaches these; cancellation
// of such a bot is a no-op, not a failure.
export const TERMINAL_RECALL_BOT_STATUS_CODES = [
  'call_ended',
  'done',
  'fatal',
  'media_expired',
  'analysis_done',
  'analysis_failed',
] as const;
