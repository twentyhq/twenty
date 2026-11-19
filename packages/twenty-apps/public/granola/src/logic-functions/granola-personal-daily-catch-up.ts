import { defineLogicFunction } from 'twenty-sdk/define';
import { listConnections } from 'twenty-sdk/logic-function';

import {
  GRANOLA_CATCH_UP_WINDOW_DAYS,
  GRANOLA_MILLISECONDS_PER_DAY,
} from 'src/constants/granola-history.constant';
import { GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME } from 'src/constants/granola-personal-connection.constant';
import {
  GRANOLA_PERSONAL_CATCH_UP_WORKER_UNIVERSAL_IDENTIFIER,
  GRANOLA_PERSONAL_DAILY_CATCH_UP_UNIVERSAL_IDENTIFIER,
  GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { buildGranolaPersonalCatchUpJob } from 'src/logic-functions/utils/build-granola-personal-catch-up-job.util';
import { buildGranolaPersonalReconcileJob } from 'src/logic-functions/utils/build-granola-personal-reconcile-job.util';
import { enqueueGranolaJobsOrThrow } from 'src/logic-functions/utils/enqueue-granola-jobs-or-throw.util';
import { getGranolaApiKeyFingerprint } from 'src/logic-functions/utils/get-granola-api-key-fingerprint.util';
import { isActiveGranolaPersonalConnection } from 'src/logic-functions/utils/is-active-granola-personal-connection.util';

export const granolaPersonalDailyCatchUpHandler = async () => {
  const today = Math.floor(Date.now() / GRANOLA_MILLISECONDS_PER_DAY);
  const updatedAfter = new Date(
    (today - GRANOLA_CATCH_UP_WINDOW_DAYS) * GRANOLA_MILLISECONDS_PER_DAY,
  ).toISOString();
  const connections = await listConnections({
    providerName: GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME,
    scope: 'USER',
  });
  const catchUpJobs: ReturnType<typeof buildGranolaPersonalCatchUpJob>[] = [];
  const reconcileJobs: ReturnType<typeof buildGranolaPersonalReconcileJob>[] =
    [];

  for (const connection of connections) {
    if (!isActiveGranolaPersonalConnection(connection)) {
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
    reconcileJobs.push(
      buildGranolaPersonalReconcileJob({
        scope,
        schedule: { apiKeyFingerprint, updatedAfter },
      }),
    );
  }

  await Promise.all([
    enqueueGranolaJobsOrThrow({
      logicFunctionUniversalIdentifier:
        GRANOLA_PERSONAL_CATCH_UP_WORKER_UNIVERSAL_IDENTIFIER,
      jobs: catchUpJobs,
    }),
    enqueueGranolaJobsOrThrow({
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
