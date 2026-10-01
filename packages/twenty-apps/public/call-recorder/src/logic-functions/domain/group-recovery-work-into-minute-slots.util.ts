import { CALL_RECORDING_ARTIFACT_IMPORT_SCOPES } from 'src/logic-functions/constants/call-recording-artifact-import-scopes';
import { RECALL_RECOVERY_CALLS_PER_MINUTE } from 'src/logic-functions/constants/recall-recovery-calls-per-minute';

export type CallRecordingRecoveryWork = {
  callRecordingId: string;
  kind: 'import' | 'reconcile';
};

// Each import scope runs as its own job and may read the bot, so an import
// can cost one Recall call per scope while a reconciliation costs one.
const getMaximumRecallCallCount = ({
  kind,
}: CallRecordingRecoveryWork): number =>
  kind === 'import' ? CALL_RECORDING_ARTIFACT_IMPORT_SCOPES.length : 1;

export const groupRecoveryWorkIntoMinuteSlots = (
  recoveryWork: CallRecordingRecoveryWork[],
): CallRecordingRecoveryWork[][] => {
  const minuteSlots: CallRecordingRecoveryWork[][] = [];
  let currentSlotRecallCallCount = 0;

  for (const work of recoveryWork) {
    const recallCallCount = getMaximumRecallCallCount(work);
    const currentSlot = minuteSlots[minuteSlots.length - 1];

    if (
      currentSlot === undefined ||
      currentSlotRecallCallCount + recallCallCount >
        RECALL_RECOVERY_CALLS_PER_MINUTE
    ) {
      minuteSlots.push([work]);
      currentSlotRecallCallCount = recallCallCount;
      continue;
    }

    currentSlot.push(work);
    currentSlotRecallCallCount += recallCallCount;
  }

  return minuteSlots;
};
