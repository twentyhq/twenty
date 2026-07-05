export const FirefliesBackfillOutcome = {
  DISABLED: 'disabled',
  NOT_CONFIGURED: 'not-configured',
  COMPLETED: 'completed',
  CONTINUATION_REQUESTED: 'continuation-requested',
  RATE_LIMITED: 'rate-limited',
  LIST_FAILED: 'list-failed',
} as const;

export type FirefliesBackfillOutcome =
  (typeof FirefliesBackfillOutcome)[keyof typeof FirefliesBackfillOutcome];
