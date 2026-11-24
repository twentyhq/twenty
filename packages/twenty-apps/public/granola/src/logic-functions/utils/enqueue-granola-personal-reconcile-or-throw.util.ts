import { GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type GranolaPersonalSyncScope } from 'src/logic-functions/types/granola-personal-sync-scope.type';
import { buildGranolaPersonalReconcileJob } from 'src/logic-functions/utils/build-granola-personal-reconcile-job.util';
import { enqueueGranolaJobsOrThrow } from 'src/logic-functions/utils/enqueue-granola-jobs-or-throw.util';

export const enqueueGranolaPersonalReconcileOrThrow = async (
  scope: Pick<GranolaPersonalSyncScope, 'connectionId' | 'userWorkspaceId'>,
) => {
  await enqueueGranolaJobsOrThrow({
    logicFunctionUniversalIdentifier:
      GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER,
    jobs: [buildGranolaPersonalReconcileJob({ scope })],
  });
};
