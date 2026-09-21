import { enqueueJobs } from 'twenty-sdk/logic-function';

import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { computeWorkspaceDistributionDelay } from 'src/logic-functions/domain/compute-workspace-distribution-delay.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';

export type EnqueueWorkspaceDistributedJobResult = {
  delayMs: number;
};

export const enqueueWorkspaceDistributedJob = async ({
  workspaceId,
  logicFunctionUniversalIdentifier,
  stepLabel,
}: {
  workspaceId: string;
  logicFunctionUniversalIdentifier: string;
  stepLabel: string;
}): Promise<EnqueueWorkspaceDistributedJobResult> => {
  const delayMs = computeWorkspaceDistributionDelay(workspaceId);

  try {
    await enqueueJobs({
      logicFunctionUniversalIdentifier,
      payloads: [{}],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs,
    });
  } catch (error) {
    throw buildRetryableStepFailure(stepLabel, error);
  }

  return { delayMs };
};
