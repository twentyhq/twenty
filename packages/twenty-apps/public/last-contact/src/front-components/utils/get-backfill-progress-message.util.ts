import { type BackfillStatus } from 'src/constants/backfill';

const pluralizeBatches = (count: number): string =>
  count === 1 ? '1 batch' : `${count} batches`;

const describeFailures = (failed: number): string =>
  failed === 0 ? '' : `, ${pluralizeBatches(failed)} failed`;

export const getBackfillProgressMessage = (
  backfillStatus: BackfillStatus | undefined,
): string | undefined => {
  if (backfillStatus === undefined || backfillStatus.status === 'idle') {
    return undefined;
  }

  if (backfillStatus.status === 'enqueueing') {
    return 'Counting records to back fill…';
  }

  const { total, completed, failed } = backfillStatus.progress;

  if (backfillStatus.status === 'running') {
    return `Backfilling ${completed} of ${pluralizeBatches(total)}${describeFailures(failed)}.`;
  }

  return `Last backfill finished ${pluralizeBatches(total)}${describeFailures(failed)}.`;
};
