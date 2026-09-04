import {
  type DisconnectedFathomMediaReconciliationPlan,
  type FathomMediaReconciliationCandidate,
} from 'src/logic-functions/types/fathom-media-reconciliation-plan.type';
import { isFathomMediaSettled } from 'src/logic-functions/utils/is-fathom-media-settled.util';

export const buildDisconnectedFathomMediaReconciliationPlan = (
  callRecordings: FathomMediaReconciliationCandidate[],
): DisconnectedFathomMediaReconciliationPlan => {
  const plan: DisconnectedFathomMediaReconciliationPlan = {
    callRecordingsToSettle: [],
    callRecordingsToSettleAndComplete: [],
    callRecordingsToSettleAndFail: [],
    callRecordingsToComplete: [],
    callRecordingsToFail: [],
  };

  for (const callRecording of callRecordings) {
    const reference = {
      id: callRecording.id,
      updatedAt: callRecording.updatedAt,
    };

    const isSettled = isFathomMediaSettled(callRecording);
    const isProcessing = callRecording.status === 'PROCESSING';

    if (!isProcessing && !isSettled) {
      plan.callRecordingsToSettle.push(reference);
      continue;
    }

    if (!isProcessing) {
      continue;
    }

    if (!isSettled && callRecording.hasTranscript) {
      plan.callRecordingsToSettleAndComplete.push(reference);
      continue;
    }

    if (!isSettled) {
      plan.callRecordingsToSettleAndFail.push(reference);
      continue;
    }

    if (callRecording.hasTranscript) {
      plan.callRecordingsToComplete.push(reference);
      continue;
    }

    plan.callRecordingsToFail.push(reference);
  }

  return plan;
};
