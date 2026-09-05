import { isNonEmptyString } from '@sniptt/guards';

import {
  type FathomMediaReconciliationCandidate,
  type FathomMediaReconciliationPlan,
} from 'src/logic-functions/types/fathom-media-reconciliation-plan.type';
import { isFathomCallRecordingImportComplete } from 'src/logic-functions/utils/is-fathom-call-recording-import-complete.util';
import { isFathomMediaSettled } from 'src/logic-functions/utils/is-fathom-media-settled.util';

export const buildFathomMediaReconciliationPlan = ({
  callRecordings,
  activeConnectedAccountIds,
}: {
  callRecordings: FathomMediaReconciliationCandidate[];
  activeConnectedAccountIds: string[];
}): FathomMediaReconciliationPlan => {
  const callRecordingsToComplete: Array<{ id: string; updatedAt: string }> = [];
  const activeConnectedAccountIdSet = new Set(activeConnectedAccountIds);
  const disconnectedAccountIdSet = new Set<string>();
  const importGroupsByConnectedAccountId = new Map<
    string,
    Omit<
      FathomMediaReconciliationPlan['importGroups'][number],
      'connectedAccountId'
    >
  >();

  for (const callRecording of callRecordings) {
    if (!isNonEmptyString(callRecording.connectedAccountId)) {
      continue;
    }

    if (!activeConnectedAccountIdSet.has(callRecording.connectedAccountId)) {
      disconnectedAccountIdSet.add(callRecording.connectedAccountId);
      continue;
    }

    if (
      callRecording.status === 'PROCESSING' &&
      isFathomCallRecordingImportComplete(callRecording)
    ) {
      callRecordingsToComplete.push({
        id: callRecording.id,
        updatedAt: callRecording.updatedAt,
      });
      continue;
    }

    if (isFathomMediaSettled(callRecording)) {
      continue;
    }

    const existingImportGroup = importGroupsByConnectedAccountId.get(
      callRecording.connectedAccountId,
    ) ?? { callRecordingIdsToRequest: [], downloadsToPoll: [] };

    if (isNonEmptyString(callRecording.downloadId)) {
      existingImportGroup.downloadsToPoll.push({
        callRecordingId: callRecording.id,
        downloadId: callRecording.downloadId,
      });
    } else {
      existingImportGroup.callRecordingIdsToRequest.push(callRecording.id);
    }

    importGroupsByConnectedAccountId.set(
      callRecording.connectedAccountId,
      existingImportGroup,
    );
  }

  return {
    callRecordingsToComplete,
    importGroups: [...importGroupsByConnectedAccountId].map(
      ([connectedAccountId, importGroup]) => ({
        connectedAccountId,
        ...importGroup,
      }),
    ),
    disconnectedAccountIds: [...disconnectedAccountIdSet],
  };
};
