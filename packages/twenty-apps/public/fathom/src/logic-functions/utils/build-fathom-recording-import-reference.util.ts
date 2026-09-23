import { isNonEmptyString } from '@sniptt/guards';

import { type FathomMediaReconciliationCandidate } from 'src/logic-functions/types/fathom-media-reconciliation-plan.type';
import { type FathomRecordingImportReference } from 'src/logic-functions/types/fathom-recording-import-reference.type';

export const buildFathomRecordingImportReference = (
  callRecording: Pick<
    FathomMediaReconciliationCandidate,
    | 'id'
    | 'updatedAt'
    | 'fathomRecordingImportId'
    | 'fathomRecordingImportUpdatedAt'
  >,
): FathomRecordingImportReference | undefined => {
  if (
    !isNonEmptyString(callRecording.fathomRecordingImportId) ||
    !isNonEmptyString(callRecording.fathomRecordingImportUpdatedAt)
  ) {
    return undefined;
  }

  return {
    callRecordingId: callRecording.id,
    callRecordingUpdatedAt: callRecording.updatedAt,
    fathomRecordingImportId: callRecording.fathomRecordingImportId,
    fathomRecordingImportUpdatedAt:
      callRecording.fathomRecordingImportUpdatedAt,
  };
};
