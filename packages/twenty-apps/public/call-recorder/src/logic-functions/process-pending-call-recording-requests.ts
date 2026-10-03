import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { PENDING_CALL_RECORDING_REQUESTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { recoverPendingCallRecording } from 'src/logic-functions/flows/recover-pending-call-recording.util';
import {
  retryFailedRecallCancellations,
  type RetryFailedRecallCancellationsResult,
} from 'src/logic-functions/flows/retry-failed-recall-cancellations.util';
import { enqueuePendingCallRecordingRecoveries } from 'src/logic-functions/flows/enqueue-pending-call-recording-recoveries.util';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import {
  buildRetryableStepFailure,
  buildStepFailure,
  type StepFailure,
} from 'src/logic-functions/utils/build-step-failure.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

export const processPendingCallRecordingRequestsHandler = async (
  payload: unknown,
): Promise<object> => {
  const callRecordingId = getString(asRecord(payload)?.callRecordingId);
  const now = new Date();
  const client = new CoreApiClient();

  if (!isUndefined(callRecordingId)) {
    try {
      return {
        callRecordingId,
        result: await recoverPendingCallRecording({
          client,
          callRecordingId,
          now,
        }),
      };
    } catch (error) {
      throw buildRetryableStepFailure('pending call recording recovery', error);
    }
  }

  const pendingCallRecordingRecoveryResult =
    await enqueuePendingCallRecordingRecoveries({ client, now }).catch(
      (error: unknown) => ({
        error: buildRetryableStepFailure(
          'pending call recording recovery enqueueing',
          error,
        ),
      }),
    );
  const failedCancellationResult = await retryFailedRecallCancellationsSafely(
    client,
    now,
  );

  if ('error' in pendingCallRecordingRecoveryResult) {
    throw pendingCallRecordingRecoveryResult.error;
  }

  return {
    pendingCallRecordingRecoveryResult,
    failedCancellationResult,
  };
};

const retryFailedRecallCancellationsSafely = async (
  client: CoreApiClient,
  now: Date,
): Promise<RetryFailedRecallCancellationsResult | StepFailure> => {
  try {
    return await retryFailedRecallCancellations({ client, now });
  } catch (error) {
    return buildStepFailure('failed cancellation retry', error);
  }
};

export default defineLogicFunction({
  universalIdentifier:
    PENDING_CALL_RECORDING_REQUESTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'process-pending-call-recording-requests',
  description:
    'Processes pending CallRecording requests by attaching or scheduling missing Recall bots and retrying incomplete cancellations.',
  timeoutSeconds: 250,
  handler: processPendingCallRecordingRequestsHandler,
});
