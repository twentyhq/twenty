import { randomUUID } from 'node:crypto';

import { GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type GranolaPersonalSyncScope } from 'src/logic-functions/types/granola-personal-sync-scope.type';
import { enqueueGranolaJobOrThrow } from 'src/logic-functions/utils/enqueue-granola-job-or-throw.util';

export const enqueueGranolaPersonalReconcileOrThrow = async ({
  connectionId,
  userWorkspaceId,
}: GranolaPersonalSyncScope) => {
  await enqueueGranolaJobOrThrow({
    logicFunctionUniversalIdentifier:
      GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER,
    payload: { connectedAccountId: connectionId, userWorkspaceId },
    jobId: randomUUID(),
  });
};
