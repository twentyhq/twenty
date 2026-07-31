export const FIREFLIES_BACKFILL_OUTCOME = {
  INVALID_REQUEST: 'invalid-request',
  NOT_CONFIGURED: 'not-configured',
  COMPLETED: 'completed',
  CONTINUATION_ENQUEUED: 'continuation-enqueued',
  CONTINUATION_ENQUEUE_FAILED: 'continuation-enqueue-failed',
  RATE_LIMITED: 'rate-limited',
  LIST_FAILED: 'list-failed',
} as const;
