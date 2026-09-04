import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  importCallRecordingArtifacts,
  type ImportCallRecordingArtifactsResult,
} from 'src/logic-functions/flows/import-call-recording-artifacts.util';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

type HandleCallRecordingArtifactsImportJobResult =
  | ImportCallRecordingArtifactsResult
  | {
      status: 'skipped';
      callRecordingId: string;
      reason: string;
    };

export const handleCallRecordingArtifactsImportJob = async (
  payload: unknown,
): Promise<HandleCallRecordingArtifactsImportJobResult> => {
  const body = asRecord(payload);
  const callRecordingId = getString(body?.callRecordingId);
  const requestedAt = getString(body?.requestedAt);
  const scope = getString(body?.scope);

  if (
    isUndefined(callRecordingId) ||
    isUndefined(requestedAt) ||
    (scope !== 'transcript' && scope !== 'media')
  ) {
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
      scope,
    });
  } catch (error) {
    throw buildRetryableStepFailure(
      `${scope} artifact import for call recording ${callRecordingId}`,
      error,
    );
  }
};
