import { GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type GranolaPersonalSyncScope } from 'src/logic-functions/types/granola-personal-sync-scope.type';
import { enqueueGranolaJobOrThrow } from 'src/logic-functions/utils/enqueue-granola-job-or-throw.util';
import { getGranolaJobId } from 'src/logic-functions/utils/get-granola-job-id.util';

export const enqueueGranolaPersonalReconcileOrThrow = async ({
  connectionId,
  userWorkspaceId,
}: GranolaPersonalSyncScope) => {
  const requestedAt = Date.now();

  await enqueueGranolaJobOrThrow({
    logicFunctionUniversalIdentifier:
      GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER,
    payload: { connectedAccountId: connectionId, userWorkspaceId },
    jobId: getGranolaJobId({
      prefix: 'granola-personal-reconcile',
      identity: { connectionId, requestedAt },
    }),
  });
};
