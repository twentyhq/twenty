import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'src/utils/is-defined';

import { type FathomRecordingImportReference } from 'src/logic-functions/types/fathom-recording-import-reference.type';
import {
  type FathomMediaReconciliationCandidate,
  type FathomMediaReconciliationPlan,
} from 'src/logic-functions/types/fathom-media-reconciliation-plan.type';
import { buildFathomRecordingImportReference } from 'src/logic-functions/utils/build-fathom-recording-import-reference.util';
import { isFathomCallRecordingImportComplete } from 'src/logic-functions/utils/is-fathom-call-recording-import-complete.util';
import { isFathomMediaSettled } from 'src/logic-functions/utils/is-fathom-media-settled.util';

export const buildFathomMediaReconciliationPlan = ({
  callRecordings,
  activeConnectedAccountIds,
}: {
  callRecordings: FathomMediaReconciliationCandidate[];
  activeConnectedAccountIds: string[];
}): FathomMediaReconciliationPlan => {
  const callRecordingsToComplete: FathomRecordingImportReference[] = [];
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

    const reference = buildFathomRecordingImportReference(callRecording);

    if (!isDefined(reference)) {
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
      callRecordingsToComplete.push(reference);
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
