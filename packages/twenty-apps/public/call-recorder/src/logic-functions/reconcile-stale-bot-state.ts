import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/stale-bot-state-logic-function-universal-identifier';
import { STALE_BOT_STATE_CRON_PATTERN } from 'src/logic-functions/constants/stale-bot-state-cron-pattern';
import {
  healCallRecordingsMissingBot,
  type HealCallRecordingsMissingBotResult,
} from 'src/logic-functions/flows/heal-call-recordings-missing-bot.util';
import {
  reapOrphanedCallRecorders,
  type ReapOrphanedCallRecordersResult,
} from 'src/logic-functions/flows/reap-orphaned-call-recorders.util';

// Every unwanted bot passes through this join_at window before it can attend.
const REAPER_JOIN_AT_LOOKBACK_HOURS = 4;
const REAPER_JOIN_AT_LOOKAHEAD_HOURS = 24;

type StepFailure = { error: string };

const reconcileStaleBotStateHandler = async (): Promise<object> => {
  const now = new Date();
  const client = new CoreApiClient();

  const botlessHealResult = await healCallRecordingsMissingBotSafely(
    client,
    now,
  );
  const orphanedBotReapingResult =
    await reapOrphanedCallRecordersInJoinAtWindow(client, now);

  return {
    botlessHealResult,
    orphanedBotReapingResult,
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

const reapOrphanedCallRecordersInJoinAtWindow = async (
  client: CoreApiClient,
  now: Date,
): Promise<ReapOrphanedCallRecordersResult | StepFailure> => {
  try {
    return await reapOrphanedCallRecorders({
      client,
      joinAtAfter: new Date(
        now.getTime() - REAPER_JOIN_AT_LOOKBACK_HOURS * 60 * 60 * 1000,
      ).toISOString(),
      joinAtBefore: new Date(
        now.getTime() + REAPER_JOIN_AT_LOOKAHEAD_HOURS * 60 * 60 * 1000,
      ).toISOString(),
    });
  } catch (error) {
    return buildStepFailure('orphaned bot reaping', error);
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
    'Frequent bot-state cron: schedules bots for recordings still missing one and reaps unclaimed bots in the near-term join window. Lost-webhook status convergence runs on its own lower-frequency cron. Reads calendar events only to heal already-decided recordings, never to discover meetings.',
  timeoutSeconds: 250,
  handler: reconcileStaleBotStateHandler,
  cronTriggerSettings: {
    pattern: STALE_BOT_STATE_CRON_PATTERN,
  },
});
