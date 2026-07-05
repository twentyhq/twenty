export const FirefliesBackfillKickoffOutcome = {
  BACKFILL_REQUESTED: 'backfill-requested',
  SKIPPED_DISABLED: 'skipped-disabled',
} as const;

export type FirefliesBackfillKickoffOutcome =
  (typeof FirefliesBackfillKickoffOutcome)[keyof typeof FirefliesBackfillKickoffOutcome];
