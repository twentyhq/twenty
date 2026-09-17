import { type BackfillStatus } from 'src/constants/backfill';

const describeFailures = (failed: number): string =>
  failed === 0 ? '' : `, ${failed} failed`;

// The ring carries the progress, so the label stays short enough to sit on one
// line next to it.
export const getBackfillProgressMessage = (
  backfillStatus: BackfillStatus | undefined,
): string | undefined => {
  if (backfillStatus === undefined || backfillStatus.status === 'idle') {
    return undefined;
  }

  if (backfillStatus.status === 'enqueueing') {
    return 'Counting records…';
  }

  const { total, completed, failed } = backfillStatus.progress;

  if (backfillStatus.status === 'running') {
    return `${completed} of ${total} batches${describeFailures(failed)}`;
  }

  return `${total} batches done${describeFailures(failed)}`;
};
