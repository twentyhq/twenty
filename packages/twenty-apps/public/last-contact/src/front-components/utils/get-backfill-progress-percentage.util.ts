import { type BackfillStatus } from 'src/constants/backfill';

export const getBackfillProgressPercentage = (
  backfillStatus: BackfillStatus | undefined,
): number | undefined => {
  if (
    backfillStatus === undefined ||
    backfillStatus.status === 'idle' ||
    backfillStatus.status === 'enqueueing'
  ) {
    return undefined;
  }

  const { total, completed } = backfillStatus.progress;

  // A run with no records to process is wholly done, and 0/0 is not a ratio.
  return total === 0 ? 100 : Math.round((completed / total) * 100);
};
