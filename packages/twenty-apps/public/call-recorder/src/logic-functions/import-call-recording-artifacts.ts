import { isNull, isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/import-call-recording-artifacts-logic-function-universal-identifier';
import { IMPORT_CALL_RECORDING_ARTIFACTS_ROUTE_PATH } from 'src/constants/import-call-recording-artifacts-route-path';
import {
  importCallRecordingArtifacts,
  type ImportCallRecordingArtifactsResult,
} from 'src/logic-functions/flows/import-call-recording-artifacts.util';
import { type CallRecordingArtifactsImportRequest } from 'src/logic-functions/types/call-recording-artifacts-import-request.type';
import { getString } from 'src/logic-functions/utils/get-string.util';

export const importCallRecordingArtifactsHandler = async (
  payload: RoutePayload<Partial<CallRecordingArtifactsImportRequest>>,
): Promise<ImportCallRecordingArtifactsResult> => {
  const request = parseCallRecordingArtifactsImportRequest(payload.body);

  if (isUndefined(request)) {
    return {
      status: 'skipped',
      callRecordingId: getString(payload.body?.callRecordingId) ?? 'unknown',
      reason: 'invalid call recording artifacts import request',
    };
  }

  return importCallRecordingArtifacts({
    client: new CoreApiClient(),
    request,
  });
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
    'Imports recording media and transcript artifacts after a verified Recall webhook resolves the owning CallRecording.',
  timeoutSeconds: 250,
  handler: importCallRecordingArtifactsHandler,
  httpRouteTriggerSettings: {
    path: IMPORT_CALL_RECORDING_ARTIFACTS_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
