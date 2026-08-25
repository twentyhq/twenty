import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/import-call-recording-artifacts-logic-function-universal-identifier';
import {
  importCallRecordingArtifacts,
  type ImportCallRecordingArtifactsResult,
} from 'src/logic-functions/flows/import-call-recording-artifacts.util';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

export const importCallRecordingArtifactsHandler = async (
  payload: unknown,
): Promise<ImportCallRecordingArtifactsResult> => {
  const body = asRecord(payload);
  const callRecordingId = getString(body?.callRecordingId);
  const requestedAt = getString(body?.requestedAt);

  if (isUndefined(callRecordingId) || isUndefined(requestedAt)) {
    return {
      status: 'skipped',
      callRecordingId: callRecordingId ?? 'unknown',
      reason: 'invalid call recording artifacts import request',
    };
  }

  try {
    return await importCallRecordingArtifacts({
      client: new CoreApiClient(),
      request: { callRecordingId, requestedAt },
    });
  } catch (error) {
    throw buildRetryableStepFailure(
      `artifact import for call recording ${callRecordingId}`,
      error,
    );
  }
};

export default defineLogicFunction({
  universalIdentifier:
    IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'import-call-recording-artifacts',
  description:
    'Imports recording media and transcript artifacts as an enqueued job after a verified Recall webhook resolves the owning CallRecording.',
  timeoutSeconds: 250,
  handler: importCallRecordingArtifactsHandler,
});
