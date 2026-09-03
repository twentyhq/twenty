import { isNumber, isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  importCallRecordingArtifacts,
  type ImportCallRecordingArtifactsResult,
} from 'src/logic-functions/flows/import-call-recording-artifacts.util';
import { type CallRecordingArtifactImportScope } from 'src/logic-functions/types/call-recording-artifact-scope.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

export const handleCallRecordingArtifactsImportJob = async ({
  payload,
  scope,
}: {
  payload: unknown;
  scope: CallRecordingArtifactImportScope;
}): Promise<ImportCallRecordingArtifactsResult> => {
  const body = asRecord(payload);
  const callRecordingId = getString(body?.callRecordingId);
  const requestedAt = getString(body?.requestedAt);
  const leaseRetryCount =
    isNumber(body?.leaseRetryCount) &&
    Number.isSafeInteger(body.leaseRetryCount) &&
    body.leaseRetryCount >= 0
      ? body.leaseRetryCount
      : 0;

  if (isUndefined(callRecordingId) || isUndefined(requestedAt)) {
    return {
      status: 'skipped',
      callRecordingId: callRecordingId ?? 'unknown',
      scope,
      reason: 'invalid call recording artifacts import request',
    };
  }

  try {
    return await importCallRecordingArtifacts({
      client: new CoreApiClient(),
      request: { callRecordingId, requestedAt, leaseRetryCount },
      scope,
    });
  } catch (error) {
    throw buildRetryableStepFailure(
      `${scope} artifact import for call recording ${callRecordingId}`,
      error,
    );
  }
};
