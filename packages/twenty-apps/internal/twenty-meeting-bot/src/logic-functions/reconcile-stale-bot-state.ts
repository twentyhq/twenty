import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/stale-bot-state-logic-function-universal-identifier';
import { STALE_BOT_STATE_CRON_PATTERN } from 'src/logic-functions/constants/stale-bot-state-cron-pattern';
import {
  convergeDivergedCallRecordings,
  type ConvergeDivergedCallRecordingsResult,
} from 'src/logic-functions/flows/converge-diverged-call-recordings.util';
import {
  healCallRecordingsMissingBot,
  type HealCallRecordingsMissingBotResult,
} from 'src/logic-functions/flows/heal-call-recordings-missing-bot.util';
import {
  reapOrphanedMeetingBots,
  type ReapOrphanedMeetingBotsResult,
} from 'src/logic-functions/flows/reap-orphaned-meeting-bots.util';
import {
  reconcilePendingTranscripts,
  type ReconcilePendingTranscriptsResult,
} from 'src/logic-functions/flows/reconcile-pending-transcripts.util';

// Every unwanted bot passes through this join_at window before it can attend.
const REAPER_JOIN_AT_LOOKBACK_HOURS = 4;
const REAPER_JOIN_AT_LOOKAHEAD_HOURS = 24;

type StepFailure = { error: string };

const handler = async (): Promise<object> => {
  const now = new Date();
  const client = new CoreApiClient();

  const botlessHealResult = await healCallRecordingsMissingBotSafely(
    client,
    now,
  );
  const orphanedBotReapingResult = await reapOrphanedMeetingBotsInJoinAtWindow(
    client,
    now,
  );
  const statusConvergenceResult = await convergeDivergedCallRecordingsSafely(
    client,
    now,
  );
  const pendingTranscriptResult = await reconcilePendingTranscriptsSafely(
    client,
    now,
  );

  return {
    botlessHealResult,
    orphanedBotReapingResult,
    statusConvergenceResult,
    pendingTranscriptResult,
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

const reapOrphanedMeetingBotsInJoinAtWindow = async (
  client: CoreApiClient,
  now: Date,
): Promise<ReapOrphanedMeetingBotsResult | StepFailure> => {
  try {
    return await reapOrphanedMeetingBots({
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

const convergeDivergedCallRecordingsSafely = async (
  client: CoreApiClient,
  now: Date,
): Promise<ConvergeDivergedCallRecordingsResult | StepFailure> => {
  try {
    return await convergeDivergedCallRecordings({ client, now });
  } catch (error) {
    return buildStepFailure('call recording status convergence', error);
  }
};

const reconcilePendingTranscriptsSafely = async (
  client: CoreApiClient,
  now: Date,
): Promise<ReconcilePendingTranscriptsResult | StepFailure> => {
  try {
    return await reconcilePendingTranscripts({ client, now });
  } catch (error) {
    return buildStepFailure('pending transcript reconciliation', error);
  }
};

const buildStepFailure = (stepLabel: string, error: unknown): StepFailure => {
  const errorMessage = error instanceof Error ? error.message : String(error);

  console.error(`[twenty-meeting-bot] ${stepLabel} failed: ${errorMessage}`);

  return { error: errorMessage };
};

export default defineLogicFunction({
  universalIdentifier: STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-stale-bot-state',
  description:
    'Converges call recordings with Recall on a schedule: pulls stale bot statuses and overdue transcripts, finishes failed cancellations, schedules bots for recordings still missing one, and reaps unclaimed bots. Reads calendar events only to heal already-decided recordings, never to discover meetings.',
  // Convergence may re-ingest missed media; transfers dominate the budget.
  timeoutSeconds: 300,
  handler,
  cronTriggerSettings: {
    pattern: STALE_BOT_STATE_CRON_PATTERN,
  },
});
