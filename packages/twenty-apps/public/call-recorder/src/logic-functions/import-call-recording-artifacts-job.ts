import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { IMPORT_CALL_RECORDING_ARTIFACTS_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/import-call-recording-artifacts-job-logic-function-universal-identifier';
import {
  importCallRecordingArtifacts,
  type ImportCallRecordingArtifactsResult,
} from 'src/logic-functions/flows/import-call-recording-artifacts.util';
import { type CallRecordingArtifactsImportRequest } from 'src/logic-functions/types/call-recording-artifacts-import-request.type';
import { getString } from 'src/logic-functions/utils/get-string.util';
import { parseCallRecordingArtifactsImportRequest } from 'src/logic-functions/utils/parse-call-recording-artifacts-import-request.util';

// Provider or storage errors propagate so the queue retries the job; a
// malformed payload never becomes valid, so it skips instead of retrying.
export const importCallRecordingArtifactsJobHandler = async (
  payload: Partial<CallRecordingArtifactsImportRequest> | null | undefined,
): Promise<ImportCallRecordingArtifactsResult> => {
  const request = parseCallRecordingArtifactsImportRequest(payload);

  if (isUndefined(request)) {
    return {
      status: 'skipped',
      callRecordingId: getString(payload?.callRecordingId) ?? 'unknown',
      reason: 'invalid call recording artifacts import request',
    };
  }

  return importCallRecordingArtifacts({
    client: new CoreApiClient(),
    request,
  });
};

export default defineLogicFunction({
  universalIdentifier:
    IMPORT_CALL_RECORDING_ARTIFACTS_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'import-call-recording-artifacts-job',
  description:
    'Imports recording media and transcript artifacts for one call recording as an enqueued job with queue retries.',
  timeoutSeconds: 250,
  handler: importCallRecordingArtifactsJobHandler,
});
