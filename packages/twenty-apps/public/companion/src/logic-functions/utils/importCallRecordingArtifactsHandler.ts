import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { importCallRecordingArtifacts } from 'src/logic-functions/flows/utils/importCallRecordingArtifacts';
import { type ImportCallRecordingArtifactsResult } from 'src/logic-functions/types/ImportCallRecordingArtifactsResult';
import { asRecord } from 'src/logic-functions/utils/asRecord';
import { buildStepError } from 'src/logic-functions/utils/buildStepError';
import { getString } from 'src/logic-functions/utils/getString';

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
    throw buildStepError(
      `artifact import for call recording ${callRecordingId}`,
      error,
    );
  }
};
