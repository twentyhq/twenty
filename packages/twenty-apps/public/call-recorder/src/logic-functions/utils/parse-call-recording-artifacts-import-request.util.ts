import { isNull, isUndefined } from '@sniptt/guards';

import { type CallRecordingArtifactsImportRequest } from 'src/logic-functions/types/call-recording-artifacts-import-request.type';
import { getString } from 'src/logic-functions/utils/get-string.util';

export const parseCallRecordingArtifactsImportRequest = (
  body: Partial<CallRecordingArtifactsImportRequest> | null | undefined,
): CallRecordingArtifactsImportRequest | undefined => {
  if (isNull(body) || isUndefined(body)) {
    return undefined;
  }

  const callRecordingId = getString(body.callRecordingId);
  const requestedAt = getString(body.requestedAt);

  if (isUndefined(callRecordingId) || isUndefined(requestedAt)) {
    return undefined;
  }

  return { callRecordingId, requestedAt };
};
