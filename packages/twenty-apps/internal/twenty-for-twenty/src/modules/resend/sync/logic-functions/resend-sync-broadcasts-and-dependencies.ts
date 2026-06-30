import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  RESEND_SYNC_CRON_PATTERNS,
  RESEND_SYNC_SLOT_DEADLINE_SLACK_MS,
  RESEND_SYNC_SLOT_TIMEOUT_SECONDS,
} from '@modules/resend/constants/sync-config';
import { RESEND_SYNC_BROADCASTS_AND_DEPENDENCIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from '@modules/resend/constants/universal-identifiers';
import { getResendClient } from '@modules/resend/shared/utils/get-resend-client';
import type { StepOutcome } from '@modules/resend/sync/types/step-outcome';
import { logStepOutcome } from '@modules/resend/sync/utils/log-step-outcome';
import {
  runSyncStep,
  skipDueToFailedDependencies,
} from '@modules/resend/sync/utils/run-sync-step';
import {
  summariseOutcomes,
  type SyncSummaryStep,
} from '@modules/resend/sync/utils/summarise-outcomes';
import { syncBroadcasts } from '@modules/resend/sync/utils/sync-broadcasts';
import { syncSegments } from '@modules/resend/sync/utils/sync-segments';
import { syncTopics } from '@modules/resend/sync/utils/sync-topics';

type ResendSyncBroadcastsAndDependenciesSummary = {
  totalDurationMs: number;
  steps: SyncSummaryStep[];
};

export const resendSyncBroadcastsAndDependenciesHandler =
  async (): Promise<ResendSyncBroadcastsAndDependenciesSummary> => {
    const resendClient = getResendClient();
    const coreApiClient = new CoreApiClient();
    const syncedAt = new Date().toISOString();

    const deadlineAtMs =
      Date.now() +
      RESEND_SYNC_SLOT_TIMEOUT_SECONDS.BROADCASTS * 1_000 -
      RESEND_SYNC_SLOT_DEADLINE_SLACK_MS;

    const topics = await runSyncStep('TOPICS', () =>
      syncTopics(resendClient, coreApiClient, syncedAt, { deadlineAtMs }),
    );

    const segments = await runSyncStep('SEGMENTS', () =>
      syncSegments(resendClient, coreApiClient, syncedAt, { deadlineAtMs }),
    );

    const broadcasts =
      topics.status === 'ok' && segments.status === 'ok'
        ? await runSyncStep('BROADCASTS', () =>
            syncBroadcasts(resendClient, coreApiClient, { deadlineAtMs }),
          )
        : skipDueToFailedDependencies('BROADCASTS', { topics, segments });

    const outcomes: ReadonlyArray<StepOutcome<unknown>> = [
      topics,
      segments,
      broadcasts,
    ];

    for (const outcome of outcomes) {
      logStepOutcome(outcome);
    }

    const { totalDurationMs, steps } = summariseOutcomes(outcomes);

    return { totalDurationMs, steps };
  };

export default defineLogicFunction({
  universalIdentifier:
    RESEND_SYNC_BROADCASTS_AND_DEPENDENCIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'resend-sync-broadcasts-and-dependencies',
  description:
    'Syncs Resend topics, segments, and broadcasts in sequence. Broadcasts depend on the in-memory topic and segment id maps produced by the first two steps. Each step has its own cursor and resumes from the last advance on the next tick if the function timeouts mid-pagination.',
  timeoutSeconds: RESEND_SYNC_SLOT_TIMEOUT_SECONDS.BROADCASTS,
  handler: resendSyncBroadcastsAndDependenciesHandler,
  cronTriggerSettings: {
    pattern: RESEND_SYNC_CRON_PATTERNS.BROADCASTS,
  },
});
