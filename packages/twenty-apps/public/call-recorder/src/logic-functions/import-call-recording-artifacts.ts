import { isNull, isUndefined } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import { IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/import-call-recording-artifacts-logic-function-universal-identifier';
import { createRetryingCoreApiClient } from 'src/logic-functions/data/create-retrying-core-api-client.util';
import {
  importCallRecordingArtifacts,
  type ImportCallRecordingArtifactsResult,
} from 'src/logic-functions/flows/import-call-recording-artifacts.util';
import { type CallRecordingArtifactsImportRequest } from 'src/logic-functions/types/call-recording-artifacts-import-request.type';
import { getString } from 'src/logic-functions/utils/get-string.util';

export const importCallRecordingArtifactsHandler = async (
  payload: unknown,
): Promise<ImportCallRecordingArtifactsResult> => {
  const request = parseCallRecordingArtifactsImportRequest(
    payload as Partial<CallRecordingArtifactsImportRequest> | null | undefined,
  );

  if (isUndefined(request)) {
    return {
      status: 'skipped',
      callRecordingId:
        getString(
          (payload as Partial<CallRecordingArtifactsImportRequest> | null)
            ?.callRecordingId,
        ) ?? 'unknown',
      reason: 'invalid call recording artifacts import request',
    };
  }

  try {
    return await importCallRecordingArtifacts({
      client: createRetryingCoreApiClient(),
      request,
    });
  } catch (error) {
    throw new RetryableLogicFunctionError(
      `[call-recorder] artifact import failed for call recording ${request.callRecordingId}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const parseCallRecordingArtifactsImportRequest = (
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

export default defineLogicFunction({
  universalIdentifier:
    IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'import-call-recording-artifacts',
  description:
    'Imports recording media and transcript artifacts as an enqueued job after a verified Recall webhook resolves the owning CallRecording.',
  timeoutSeconds: 250,
  handler: importCallRecordingArtifactsHandler,
});
