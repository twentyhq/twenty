import {
  enqueueJobs,
  RetryableLogicFunctionError,
  type EnqueueJobsInput,
} from 'twenty-sdk/logic-function';

import { GRANOLA_JOB_RETRY_LIMIT } from 'src/constants/granola-history.constant';
import { buildRetryableGranolaError } from 'src/logic-functions/utils/build-retryable-granola-error.util';

const MAX_GRANOLA_JOBS_PER_ENQUEUE = 200;

export const enqueueGranolaJobsOrThrow = async ({
  jobs,
  ...options
}: Pick<EnqueueJobsInput, 'logicFunctionUniversalIdentifier' | 'delayMs'> &
  Required<Pick<EnqueueJobsInput, 'jobs'>>): Promise<void> => {
  for (
    let index = 0;
    index < jobs.length;
    index += MAX_GRANOLA_JOBS_PER_ENQUEUE
  ) {
    const result = await enqueueJobs({
      ...options,
      jobs: jobs.slice(index, index + MAX_GRANOLA_JOBS_PER_ENQUEUE),
      retryLimit: GRANOLA_JOB_RETRY_LIMIT,
    }).catch((error: unknown) => {
      throw buildRetryableGranolaError({ operation: 'Job enqueue', error });
    });

    if (!result.enqueued) {
      throw new RetryableLogicFunctionError(
        'Could not enqueue the Granola jobs.',
      );
    }
  }
};
