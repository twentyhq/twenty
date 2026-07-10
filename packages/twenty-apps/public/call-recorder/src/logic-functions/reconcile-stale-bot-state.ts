import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/stale-bot-state-logic-function-universal-identifier';
import { STALE_BOT_STATE_CRON_PATTERN } from 'src/logic-functions/constants/stale-bot-state-cron-pattern';
import {
  retryFailedRecallCancellations,
  type RetryFailedRecallCancellationsResult,
} from 'src/logic-functions/flows/retry-failed-recall-cancellations.util';
import {
  healCallRecordingsMissingBot,
  type HealCallRecordingsMissingBotResult,
} from 'src/logic-functions/flows/heal-call-recordings-missing-bot.util';
import {
  buildStepFailure,
  type StepFailure,
} from 'src/logic-functions/utils/build-step-failure.util';

const reconcileStaleBotStateHandler = async (): Promise<object> => {
  const now = new Date();
  const client = new CoreApiClient();

  const botlessHealResult = await healCallRecordingsMissingBotSafely(
    client,
    now,
  );
  const failedCancellationResult =
    await retryFailedRecallCancellationsSafely(client);

  return {
    botlessHealResult,
    failedCancellationResult,
  };
};

const healCallRecordingsMissingBotSafely = async (
  client: CoreApiClient,
  now: Date,
): Promise<HealCallRecordingsMissingBotResult | StepFailure> => {
  try {
    return await healCallRecordingsMissingBot({ client, now });
  } catch (error) {
    return buildStepFailure('botless call recording healing', error);
  }
};

const retryFailedRecallCancellationsSafely = async (
  client: CoreApiClient,
): Promise<RetryFailedRecallCancellationsResult | StepFailure> => {
  try {
    return await retryFailedRecallCancellations({ client });
  } catch (error) {
    return buildStepFailure('failed cancellation retry', error);
  }
};

export default defineLogicFunction({
  universalIdentifier: STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-stale-bot-state',
  description:
    'Retries failed cancellations and attaches or schedules bots for recordings still missing one, reading only local records unless a recording actually diverged.',
  timeoutSeconds: 250,
  handler: reconcileStaleBotStateHandler,
  cronTriggerSettings: {
    pattern: STALE_BOT_STATE_CRON_PATTERN,
  },
});
