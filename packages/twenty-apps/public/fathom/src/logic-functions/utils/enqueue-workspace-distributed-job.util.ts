import { buildRetryableFathomError } from 'src/logic-functions/utils/build-retryable-fathom-error.util';
import { computeWorkspaceDistributionDelay } from 'src/logic-functions/utils/compute-workspace-distribution-delay.util';
import { enqueueFathomJobsOrThrow } from 'src/logic-functions/utils/enqueue-fathom-jobs-or-throw.util';

export const enqueueWorkspaceDistributedJob = async ({
  workspaceId,
  logicFunctionUniversalIdentifier,
  operation,
}: {
  workspaceId: string;
  logicFunctionUniversalIdentifier: string;
  operation: string;
}): Promise<{ delayMs: number }> => {
  const delayMs = computeWorkspaceDistributionDelay(workspaceId);

  try {
    await enqueueFathomJobsOrThrow({
      logicFunctionUniversalIdentifier,
      payloads: [{}],
      delayMs,
    });
  } catch (error) {
    throw buildRetryableFathomError({ operation, error });
  }

  return { delayMs };
};
