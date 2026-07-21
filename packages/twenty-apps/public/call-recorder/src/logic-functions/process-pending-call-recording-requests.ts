import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { PENDING_CALL_RECORDING_REQUESTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/pending-call-recording-requests-logic-function-universal-identifier';
import { PENDING_CALL_RECORDING_REQUESTS_CRON_PATTERN } from 'src/logic-functions/constants/pending-call-recording-requests-cron-pattern';
import {
  retryFailedRecallCancellations,
  type RetryFailedRecallCancellationsResult,
} from 'src/logic-functions/flows/retry-failed-recall-cancellations.util';
import {
  scheduleRecallBotsForPendingCallRecordings,
  type ScheduleRecallBotsForPendingCallRecordingsResult,
} from 'src/logic-functions/flows/schedule-recall-bots-for-pending-call-recordings.util';
import {
  buildStepFailure,
  type StepFailure,
} from 'src/logic-functions/utils/build-step-failure.util';

const processPendingCallRecordingRequestsHandler =
  async (): Promise<object> => {
    const now = new Date();
    const client = new CoreApiClient();

    const pendingCallRecordingScheduleResult =
      await scheduleRecallBotsForPendingCallRecordingsSafely(client, now);
    const failedCancellationResult =
      await retryFailedRecallCancellationsSafely(client, now);

    return {
      pendingCallRecordingScheduleResult,
      failedCancellationResult,
    };
  };

const scheduleRecallBotsForPendingCallRecordingsSafely = async (
  client: CoreApiClient,
  now: Date,
): Promise<ScheduleRecallBotsForPendingCallRecordingsResult | StepFailure> => {
  try {
    return await scheduleRecallBotsForPendingCallRecordings({ client, now });
  } catch (error) {
    return buildStepFailure('pending Recall bot scheduling', error);
  }
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
  cronTriggerSettings: {
    pattern: PENDING_CALL_RECORDING_REQUESTS_CRON_PATTERN,
  },
});
