import { GRANOLA_HISTORY_BATCH_INTERVAL_MILLISECONDS } from 'src/constants/granola-history.constant';

export const getGranolaBatchSchedule = ({
  now,
  nextAvailableAt,
  batchCount,
}: {
  now: number;
  nextAvailableAt?: number;
  batchCount: number;
}) => {
  const startsAt = Math.max(now, nextAvailableAt ?? now);
  const nextBatchAvailableAt =
    startsAt + batchCount * GRANOLA_HISTORY_BATCH_INTERVAL_MILLISECONDS;

  return {
    batchDelays: Array.from(
      { length: batchCount },
      (_, index) =>
        startsAt - now + index * GRANOLA_HISTORY_BATCH_INTERVAL_MILLISECONDS,
    ),
    continuationDelay: Math.max(
      GRANOLA_HISTORY_BATCH_INTERVAL_MILLISECONDS,
      nextBatchAvailableAt - now,
    ),
    nextBatchAvailableAt,
  };
};
