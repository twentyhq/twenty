import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  enqueueJobs,
  listConnections,
  RetryableLogicFunctionError,
  type EnqueueJobsInput,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import {
  GRANOLA_CATCH_UP_WINDOW_DAYS,
  GRANOLA_JOB_RETRY_LIMIT,
  GRANOLA_MILLISECONDS_PER_DAY,
} from 'src/constants/granola-history.constant';
import { GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME } from 'src/constants/granola-personal-connection.constant';
import {
  GRANOLA_PERSONAL_CATCH_UP_WORKER_UNIVERSAL_IDENTIFIER,
  GRANOLA_PERSONAL_DAILY_CATCH_UP_UNIVERSAL_IDENTIFIER,
  GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type granolaPersonalReconcileHandler } from 'src/logic-functions/granola-personal-reconcile';
import { buildGranolaPersonalCatchUpJob } from 'src/logic-functions/utils/build-granola-personal-catch-up-job.util';
import { buildRetryableGranolaError } from 'src/logic-functions/utils/build-retryable-granola-error.util';
import { getGranolaApiKeyFingerprint } from 'src/logic-functions/utils/get-granola-api-key-fingerprint.util';
import { getGranolaJobId } from 'src/logic-functions/utils/get-granola-job-id.util';
import { isGranolaPersonalSyncEnabled } from 'src/logic-functions/utils/is-granola-personal-sync-enabled.util';

const MAX_GRANOLA_JOBS_PER_ENQUEUE = 200;
type GranolaMaintenanceJobs = NonNullable<EnqueueJobsInput['jobs']>;

const enqueueMaintenanceJobsOrThrow = async ({
  logicFunctionUniversalIdentifier,
  jobs,
}: {
  logicFunctionUniversalIdentifier: string;
  jobs: GranolaMaintenanceJobs;
}) => {
  for (
    let index = 0;
    index < jobs.length;
    index += MAX_GRANOLA_JOBS_PER_ENQUEUE
  ) {
    const result = await enqueueJobs({
      logicFunctionUniversalIdentifier,
      jobs: jobs.slice(index, index + MAX_GRANOLA_JOBS_PER_ENQUEUE),
      retryLimit: GRANOLA_JOB_RETRY_LIMIT,
    }).catch((error: unknown) => {
      throw buildRetryableGranolaError({
        operation: 'Personal maintenance enqueue',
        error,
      });
    });

    if (!result.enqueued) {
      throw new RetryableLogicFunctionError(
        'Could not enqueue Granola personal maintenance.',
      );
    }
  }
};

export const granolaPersonalDailyCatchUpHandler = async () => {
  if (!isGranolaPersonalSyncEnabled()) {
    return { success: true, skipped: true };
  }

  const today = Math.floor(Date.now() / GRANOLA_MILLISECONDS_PER_DAY);
  const updatedAfter = new Date(
    (today - GRANOLA_CATCH_UP_WINDOW_DAYS) * GRANOLA_MILLISECONDS_PER_DAY,
  ).toISOString();
  const connections = await listConnections({
    providerName: GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME,
    scope: 'USER',
  });
  const catchUpJobs: GranolaMaintenanceJobs = [];
  const reconcileJobs: GranolaMaintenanceJobs = [];

  for (const connection of connections) {
    if (
      !isDefined(connection.workspaceMemberId) ||
      isDefined(connection.authFailedAt) ||
      !isNonEmptyString(connection.accessToken)
    ) {
      continue;
    }

    const scope = {
      connectionId: connection.id,
      userWorkspaceId: connection.userWorkspaceId,
    };
    const apiKeyFingerprint = getGranolaApiKeyFingerprint(
      connection.accessToken,
    );

    catchUpJobs.push(
      buildGranolaPersonalCatchUpJob({
        kind: 'scan',
        pageIndex: 0,
        scope,
        apiKeyFingerprint,
        updatedAfter,
      }),
    );
    const reconcilePayload = {
      connectedAccountId: scope.connectionId,
      userWorkspaceId: scope.userWorkspaceId,
      scheduledApiKeyFingerprint: apiKeyFingerprint,
    } satisfies Parameters<typeof granolaPersonalReconcileHandler>[0];

    reconcileJobs.push({
      payload: reconcilePayload,
      jobId: getGranolaJobId({
        prefix: 'granola-discovery',
        identity: { ...reconcilePayload, updatedAfter },
      }),
    });
  }

  await Promise.all([
    enqueueMaintenanceJobsOrThrow({
      logicFunctionUniversalIdentifier:
        GRANOLA_PERSONAL_CATCH_UP_WORKER_UNIVERSAL_IDENTIFIER,
      jobs: catchUpJobs,
    }),
    enqueueMaintenanceJobsOrThrow({
      logicFunctionUniversalIdentifier:
        GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER,
      jobs: reconcileJobs,
    }),
  ]);

  return { success: true, enqueuedConnectionCount: catchUpJobs.length };
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_PERSONAL_DAILY_CATCH_UP_UNIVERSAL_IDENTIFIER,
  name: 'granola-personal-daily-catch-up',
  description:
    'Schedules note recovery and webhook repair for personal Granola connections.',
  timeoutSeconds: 120,
  handler: granolaPersonalDailyCatchUpHandler,
  cronTriggerSettings: { pattern: '30 4 * * *' },
});
