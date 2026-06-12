import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { STALE_RECALL_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/stale-recall-state-logic-function-universal-identifier';
import { STALE_RECALL_STATE_CRON_PATTERN } from 'src/logic-functions/constants/stale-recall-state-cron-pattern';
import {
  convergeDivergedCallRecordings,
  type ConvergeDivergedCallRecordingsResult,
} from 'src/logic-functions/flows/converge-diverged-call-recordings.util';
import {
  healCallRecordingsMissingRecallBot,
  type HealCallRecordingsMissingRecallBotResult,
} from 'src/logic-functions/flows/heal-call-recordings-missing-recall-bot.util';
import {
  reapOrphanedRecallBots,
  type ReapOrphanedRecallBotsResult,
} from 'src/logic-functions/flows/reap-orphaned-recall-bots.util';
import {
  reconcilePendingRecallTranscripts,
  type ReconcilePendingRecallTranscriptsResult,
} from 'src/logic-functions/flows/reconcile-pending-recall-transcripts.util';

// Every unwanted bot passes through this join_at window before it can attend.
const REAPER_JOIN_AT_LOOKBACK_HOURS = 4;
const REAPER_JOIN_AT_LOOKAHEAD_HOURS = 24;

type StepFailure = { error: string };

const handler = async (): Promise<object> => {
  const now = new Date();
  const client = new CoreApiClient();

  const botlessHealResult = await healCallRecordingsMissingRecallBotSafely(
    client,
    now,
  );
  const orphanedBotReapingResult = await reapOrphanedRecallBotsInJoinAtWindow(
    client,
    now,
  );
  const statusConvergenceResult = await convergeDivergedCallRecordingsSafely(
    client,
    now,
  );
  const pendingTranscriptResult = await reconcilePendingRecallTranscriptsSafely(
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

const healCallRecordingsMissingRecallBotSafely = async (
  client: CoreApiClient,
  now: Date,
): Promise<HealCallRecordingsMissingRecallBotResult | StepFailure> => {
  try {
    return await healCallRecordingsMissingRecallBot({ client, now });
  } catch (error) {
    return buildStepFailure('botless call recording healing', error);
  }
};

const reapOrphanedRecallBotsInJoinAtWindow = async (
  client: CoreApiClient,
  now: Date,
): Promise<ReapOrphanedRecallBotsResult | StepFailure> => {
  try {
    return await reapOrphanedRecallBots({
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

const reconcilePendingRecallTranscriptsSafely = async (
  client: CoreApiClient,
  now: Date,
): Promise<ReconcilePendingRecallTranscriptsResult | StepFailure> => {
  try {
    return await reconcilePendingRecallTranscripts({ client, now });
  } catch (error) {
    return buildStepFailure('pending transcript reconciliation', error);
  }
};

const buildStepFailure = (stepLabel: string, error: unknown): StepFailure => {
  const errorMessage = error instanceof Error ? error.message : String(error);

  console.error(`[recall-recording-bot] ${stepLabel} failed: ${errorMessage}`);

  return { error: errorMessage };
};

export default defineLogicFunction({
  universalIdentifier: STALE_RECALL_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-stale-recall-state',
  description:
    'Converges call recordings with Recall on a schedule: pulls stale bot statuses and overdue transcripts, finishes failed cancellations, schedules bots for recordings still missing one, and reaps unclaimed bots. Reads calendar events only to heal already-decided recordings, never to discover meetings.',
  // Convergence may re-ingest missed media; transfers dominate the budget.
  timeoutSeconds: 300,
  handler,
  cronTriggerSettings: {
    pattern: STALE_RECALL_STATE_CRON_PATTERN,
  },
});
