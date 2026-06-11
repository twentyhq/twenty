import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { STALE_RECALL_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/stale-recall-state-logic-function-universal-identifier';
import { STALE_RECALL_STATE_CRON_PATTERN } from 'src/logic-functions/constants/stale-recall-state-cron-pattern';
import {
  cancelOpenCallRecordingRequests,
  type CancelOpenCallRecordingRequestsResult,
} from 'src/logic-functions/utils/cancel-open-call-recording-requests.util';
import {
  convergeDivergedCallRecordings,
  type ConvergeDivergedCallRecordingsResult,
} from 'src/logic-functions/utils/converge-diverged-call-recordings.util';
import { getRecallRecordingBotEnabled } from 'src/logic-functions/utils/get-recall-recording-bot-enabled.util';
import {
  reapOrphanedRecallBots,
  type ReapOrphanedRecallBotsResult,
} from 'src/logic-functions/utils/reap-orphaned-recall-bots.util';
import {
  reconcilePendingRecallTranscripts,
  type ReconcilePendingRecallTranscriptsResult,
} from 'src/logic-functions/utils/reconcile-pending-recall-transcripts.util';

// Every unwanted bot passes through this join_at window before it can attend.
const REAPER_JOIN_AT_LOOKBACK_HOURS = 4;
const REAPER_JOIN_AT_LOOKAHEAD_HOURS = 24;

type StepFailure = { error: string };

const handler = async (): Promise<object> => {
  const now = new Date();
  const client = new CoreApiClient();

  const disabledCancelResult =
    await cancelOpenCallRecordingRequestsIfDisabled(client);
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
    ...(disabledCancelResult === null ? {} : { disabledCancelResult }),
    orphanedBotReapingResult,
    statusConvergenceResult,
    pendingTranscriptResult,
  };
};

const cancelOpenCallRecordingRequestsIfDisabled = async (
  client: CoreApiClient,
): Promise<CancelOpenCallRecordingRequestsResult | StepFailure | null> => {
  if (getRecallRecordingBotEnabled()) {
    return null;
  }

  try {
    return await cancelOpenCallRecordingRequests({ client });
  } catch (error) {
    return buildStepFailure('disable-time request cancellation', error);
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
    'Converges call recordings with Recall on a schedule: pulls stale bot statuses and overdue transcripts, finishes failed or disable-time cancellations, and reaps unclaimed bots. Never reads calendar events — discovery is event-driven.',
  // Convergence may re-ingest missed media; transfers dominate the budget.
  timeoutSeconds: 300,
  handler,
  cronTriggerSettings: {
    pattern: STALE_RECALL_STATE_CRON_PATTERN,
  },
});
