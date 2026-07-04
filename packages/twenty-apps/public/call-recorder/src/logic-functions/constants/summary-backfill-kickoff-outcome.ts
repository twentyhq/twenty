export const SummaryBackfillKickoffOutcome = {
  SKIPPED_INITIAL_INSTALL: 'skipped-initial-install',
  BACKFILL_REQUESTED: 'backfill-requested',
  BACKFILL_REQUEST_FAILED: 'backfill-request-failed',
} as const;

export type SummaryBackfillKickoffOutcome =
  (typeof SummaryBackfillKickoffOutcome)[keyof typeof SummaryBackfillKickoffOutcome];
