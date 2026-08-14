import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { PENDING_CALL_RECORDING_REQUESTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/pending-call-recording-requests-logic-function-universal-identifier';
import { PENDING_CALL_RECORDING_REQUESTS_CRON_PATTERN } from 'src/logic-functions/constants/pending-call-recording-requests-cron-pattern';
import { retryUnresolvedRecallBotRemovals } from 'src/logic-functions/flows/retry-unresolved-recall-bot-removals.util';
import { type RetryUnresolvedRecallBotRemovalsResult } from 'src/logic-functions/types/retry-unresolved-recall-bot-removals-result.type';
import { scheduleRecallBotsForPendingCallRecordings } from 'src/logic-functions/flows/schedule-recall-bots-for-pending-call-recordings.util';
import { type ScheduleRecallBotsForPendingCallRecordingsResult } from 'src/logic-functions/types/schedule-recall-bots-for-pending-call-recordings-result.type';
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
    const unresolvedRemovalResult =
      await retryUnresolvedRecallBotRemovalsSafely(client);

    return {
      pendingCallRecordingScheduleResult,
      unresolvedRemovalResult,
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

const retryUnresolvedRecallBotRemovalsSafely = async (
  client: CoreApiClient,
): Promise<RetryUnresolvedRecallBotRemovalsResult | StepFailure> => {
  try {
    return await retryUnresolvedRecallBotRemovals({ client });
  } catch (error) {
    return buildStepFailure('unresolved Recall bot removal retry', error);
  }
};

export default defineLogicFunction({
  universalIdentifier:
    PENDING_CALL_RECORDING_REQUESTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'process-pending-call-recording-requests',
  description:
    'Processes pending CallRecording requests and retries unresolved Recall bot ownership.',
  timeoutSeconds: 250,
  handler: processPendingCallRecordingRequestsHandler,
  cronTriggerSettings: {
    pattern: PENDING_CALL_RECORDING_REQUESTS_CRON_PATTERN,
  },
});
