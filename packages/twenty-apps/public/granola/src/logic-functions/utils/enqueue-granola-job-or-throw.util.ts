import {
  enqueueJobs,
  RetryableLogicFunctionError,
  type EnqueueJobsInput,
} from 'twenty-sdk/logic-function';

import { GRANOLA_JOB_RETRY_LIMIT } from 'src/constants/granola-history.constant';
import { buildRetryableGranolaError } from 'src/logic-functions/utils/build-retryable-granola-error.util';

export const enqueueGranolaJobOrThrow = async ({
  payload,
  jobId,
  ...options
}: Pick<EnqueueJobsInput, 'logicFunctionUniversalIdentifier' | 'delayMs'> & {
  payload: Record<string, unknown>;
  jobId: string;
}): Promise<void> => {
  const result = await enqueueJobs({
    ...options,
    jobs: [{ payload, jobId }],
    retryLimit: GRANOLA_JOB_RETRY_LIMIT,
  }).catch((error: unknown) => {
    throw buildRetryableGranolaError({ operation: 'Job enqueue', error });
  });

  if (!result.enqueued) {
    throw new RetryableLogicFunctionError(
      'Could not enqueue the Granola import.',
    );
  }
};
