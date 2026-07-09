import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/stale-bot-state-logic-function-universal-identifier';
import { STALE_BOT_STATE_CRON_PATTERN } from 'src/logic-functions/constants/stale-bot-state-cron-pattern';
import {
  finishFailedRecallCancellations,
  type FinishFailedRecallCancellationsResult,
} from 'src/logic-functions/flows/finish-failed-recall-cancellations.util';
import {
  healCallRecordingsMissingBot,
  type HealCallRecordingsMissingBotResult,
} from 'src/logic-functions/flows/heal-call-recordings-missing-bot.util';

type StepFailure = { error: string };

const reconcileStaleBotStateHandler = async (): Promise<object> => {
  const now = new Date();
  const client = new CoreApiClient();

  const botlessHealResult = await healCallRecordingsMissingBotSafely(
    client,
    now,
  );
  const failedCancellationResult =
    await finishFailedRecallCancellationsSafely(client);

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

const finishFailedRecallCancellationsSafely = async (
  client: CoreApiClient,
): Promise<FinishFailedRecallCancellationsResult | StepFailure> => {
  try {
    return await finishFailedRecallCancellations({ client });
  } catch (error) {
    return buildStepFailure('failed cancellation finishing', error);
  }
};

const buildStepFailure = (stepLabel: string, error: unknown): StepFailure => {
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[call-recorder] ${stepLabel} failed: ${errorMessage}`);
  }

  return { error: `${stepLabel} failed` };
};

export default defineLogicFunction({
  universalIdentifier: STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-stale-bot-state',
  description:
    'Finishes failed cancellations and adopts or schedules bots for recordings still missing one, reading only local records unless a recording actually diverged.',
  timeoutSeconds: 250,
  handler: reconcileStaleBotStateHandler,
  cronTriggerSettings: {
    pattern: STALE_BOT_STATE_CRON_PATTERN,
  },
});
