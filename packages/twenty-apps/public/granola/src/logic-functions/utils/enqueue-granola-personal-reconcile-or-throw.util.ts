import { randomUUID } from 'node:crypto';

import { GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type GranolaPersonalSyncScope } from 'src/logic-functions/types/granola-personal-sync-scope.type';
import { enqueueGranolaJobsOrThrow } from 'src/logic-functions/utils/enqueue-granola-jobs-or-throw.util';

export const enqueueGranolaPersonalReconcileOrThrow = async ({
  connectionId,
  userWorkspaceId,
}: GranolaPersonalSyncScope) => {
  await enqueueGranolaJobsOrThrow({
    logicFunctionUniversalIdentifier:
      GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER,
    jobs: [
      {
        payload: { connectedAccountId: connectionId, userWorkspaceId },
        jobId: randomUUID(),
      },
    ],
  });
};
