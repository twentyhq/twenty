import { kv } from 'twenty-sdk/logic-function';

import { GRANOLA_HISTORY_SCHEDULE_KEY } from 'src/constants/granola.constant';
import { getGranolaBatchSchedule } from 'src/logic-functions/utils/get-granola-batch-schedule.util';

export const reserveGranolaBackfillBatchSlotsOrThrow = async (
  batchCount: number,
) => {
  const saved = await kv.get<{ nextBatchAvailableAt: number }>(
    GRANOLA_HISTORY_SCHEDULE_KEY,
  );
  const schedule = getGranolaBatchSchedule({
    now: Date.now(),
    nextAvailableAt: saved?.nextBatchAvailableAt,
    batchCount,
  });

  if (batchCount > 0) {
    await kv.set(GRANOLA_HISTORY_SCHEDULE_KEY, {
      nextBatchAvailableAt: schedule.nextBatchAvailableAt,
    });
  }

  return schedule;
};
