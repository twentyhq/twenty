import { kv } from 'twenty-sdk/logic-function';

import { FATHOM_IMPORT_SLOT_INTERVAL_MILLISECONDS } from 'src/constants/fathom.constant';
import { getFathomImportScheduleKey } from 'src/logic-functions/utils/get-fathom-import-schedule-key.util';

type FathomImportSchedule = {
  nextBatchAvailableAt: number;
};

export const reserveFathomImportSlots = async ({
  connectedAccountId,
  slotCount,
  notBeforeDelayMilliseconds = 0,
}: {
  connectedAccountId: string;
  slotCount: number;
  notBeforeDelayMilliseconds?: number;
}): Promise<{ slotDelays: number[]; continuationDelay: number }> => {
  const now = Date.now();
  const scheduleKey = getFathomImportScheduleKey(connectedAccountId);
  const existingSchedule = await kv.get<FathomImportSchedule>(scheduleKey);
  const scheduleStart = Math.max(
    now + notBeforeDelayMilliseconds,
    existingSchedule?.nextBatchAvailableAt ?? now,
  );
  const slotDelays = Array.from(
    { length: slotCount },
    (_, slotIndex) =>
      scheduleStart -
      now +
      slotIndex * FATHOM_IMPORT_SLOT_INTERVAL_MILLISECONDS,
  );
  const nextSlotAvailableAt =
    scheduleStart + slotCount * FATHOM_IMPORT_SLOT_INTERVAL_MILLISECONDS;

  if (slotCount > 0) {
    await kv.set(scheduleKey, { nextBatchAvailableAt: nextSlotAvailableAt });
  }

  return { slotDelays, continuationDelay: nextSlotAvailableAt - now };
};
