import { kv } from 'twenty-sdk/logic-function';

import { FATHOM_BACKFILL_BATCH_STAGGER_MILLISECONDS } from 'src/constants/fathom.constant';
import { getFathomBackfillScheduleKey } from 'src/logic-functions/utils/get-fathom-backfill-schedule-key.util';

type FathomBackfillSchedule = {
  nextBatchAvailableAt: number;
};

// Every backfill of one connected account, initial or manual, appends its
// batches to the same per-account timeline so Fathom sees one paced stream
// per token instead of parallel bursts.
export const reserveFathomBackfillBatchSlots = async ({
  connectedAccountId,
  batchCount,
}: {
  connectedAccountId: string;
  batchCount: number;
}): Promise<{ batchDelays: number[]; continuationDelay: number }> => {
  const now = Date.now();
  const scheduleKey = getFathomBackfillScheduleKey(connectedAccountId);
  const existingSchedule = await kv.get<FathomBackfillSchedule>(scheduleKey);
  const scheduleStart = Math.max(
    now,
    existingSchedule?.nextBatchAvailableAt ?? now,
  );
  const batchDelays = Array.from(
    { length: batchCount },
    (_, batchIndex) =>
      scheduleStart -
      now +
      batchIndex * FATHOM_BACKFILL_BATCH_STAGGER_MILLISECONDS,
  );
  const nextBatchAvailableAt =
    scheduleStart + batchCount * FATHOM_BACKFILL_BATCH_STAGGER_MILLISECONDS;

  if (batchCount > 0) {
    await kv.set(scheduleKey, { nextBatchAvailableAt });
  }

  return { batchDelays, continuationDelay: nextBatchAvailableAt - now };
};
