import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { RECALL_RECOVERY_CALLS_PER_MINUTE } from 'src/logic-functions/constants/recall-recovery-calls-per-minute';
import { getBatches } from 'src/logic-functions/utils/get-batches.util';

export type PendingCallRecordingRecoveryMinuteSlot = {
  delayMs: number;
  callRecordingIds: string[];
};

export const groupPendingCallRecordingRecoveriesIntoMinuteSlots = (
  callRecordingIds: string[],
): PendingCallRecordingRecoveryMinuteSlot[] =>
  getBatches(callRecordingIds, RECALL_RECOVERY_CALLS_PER_MINUTE).map(
    (slotCallRecordingIds, slotIndex) => ({
      delayMs: slotIndex * MILLISECONDS_PER_MINUTE,
      callRecordingIds: slotCallRecordingIds,
    }),
  );
