import { randomUUID } from 'node:crypto';

import { isDefined } from 'twenty-sdk/utils';

import { type granolaPersonalReconcileHandler } from 'src/logic-functions/granola-personal-reconcile';
import { type GranolaPersonalSyncScope } from 'src/logic-functions/types/granola-personal-sync-scope.type';
import { getGranolaJobId } from 'src/logic-functions/utils/get-granola-job-id.util';

export const buildGranolaPersonalReconcileJob = ({
  scope: { connectionId, userWorkspaceId },
  schedule,
}: {
  scope: Pick<GranolaPersonalSyncScope, 'connectionId' | 'userWorkspaceId'>;
  schedule?: { apiKeyFingerprint: string; updatedAfter: string };
}) => {
  const payload = {
    connectedAccountId: connectionId,
    userWorkspaceId,
    ...(isDefined(schedule)
      ? { scheduledApiKeyFingerprint: schedule.apiKeyFingerprint }
      : {}),
  } satisfies Parameters<typeof granolaPersonalReconcileHandler>[0];

  return {
    payload,
    jobId: isDefined(schedule)
      ? getGranolaJobId({
          prefix: 'granola-discovery',
          identity: {
            connectedAccountId: connectionId,
            userWorkspaceId,
            updatedAfter: schedule.updatedAfter,
          },
        })
      : randomUUID(),
  };
};
