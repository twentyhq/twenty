import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/stale-bot-state-logic-function-universal-identifier';
import { STALE_BOT_STATE_CRON_PATTERN } from 'src/logic-functions/constants/stale-bot-state-cron-pattern';
import { convergeDivergedCallRecordings } from 'src/logic-functions/flows/converge-diverged-call-recordings.util';
import { type ConvergeDivergedCallRecordingsResult } from 'src/logic-functions/flows/converge-diverged-call-recordings-result.type';
import {
  scheduleRecallBotsForPendingCallRecordings,
  type ScheduleRecallBotsForPendingCallRecordingsResult,
} from 'src/logic-functions/flows/schedule-recall-bots-for-pending-call-recordings.util';
import {
  cleanupOrphanedRecallBots,
  type CleanupOrphanedRecallBotsResult,
} from 'src/logic-functions/flows/cleanup-orphaned-recall-bots.util';

// Every unwanted bot passes through this join_at window before it can attend.
const CLEANUP_JOIN_AT_LOOKBACK_HOURS = 4;
const CLEANUP_JOIN_AT_LOOKAHEAD_HOURS = 24;

type StepFailure = { error: string };

const reconcileStaleBotStateHandler = async (): Promise<object> => {
  const now = new Date();
  const client = new CoreApiClient();

  const pendingScheduleResult = await scheduleRecallBotsForPendingCallRecordingsSafely(
    client,
    now,
  );
  const orphanedBotCleanupResult =
    await cleanupOrphanedRecallBotsInJoinAtWindow(client, now);
  const statusConvergenceResult = await convergeDivergedCallRecordingsSafely(
    client,
    now,
  );

  return {
    pendingScheduleResult,
    orphanedBotCleanupResult,
    statusConvergenceResult,
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

const cleanupOrphanedRecallBotsInJoinAtWindow = async (
  client: CoreApiClient,
  now: Date,
): Promise<CleanupOrphanedRecallBotsResult | StepFailure> => {
  try {
    return await cleanupOrphanedRecallBots({
      client,
      joinAtAfter: new Date(
        now.getTime() - CLEANUP_JOIN_AT_LOOKBACK_HOURS * 60 * 60 * 1000,
      ).toISOString(),
      joinAtBefore: new Date(
        now.getTime() + CLEANUP_JOIN_AT_LOOKAHEAD_HOURS * 60 * 60 * 1000,
      ).toISOString(),
    });
  } catch (error) {
    return buildStepFailure('orphaned bot cancellation', error);
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
    'Converges call recordings with Recall on a schedule: pulls stale bot statuses and overdue transcripts, finishes failed cancellations, schedules bots for recordings still missing one, and cancels unclaimed bots. Reads calendar events only to repair already-decided recordings, never to discover meetings.',
  timeoutSeconds: 250,
  handler: reconcileStaleBotStateHandler,
  cronTriggerSettings: {
    pattern: STALE_BOT_STATE_CRON_PATTERN,
  },
});
