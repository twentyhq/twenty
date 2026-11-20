import { enqueueJobs } from 'twenty-sdk/logic-function';
import { ENQUEUE_JOBS_MAX_BATCH_SIZE } from 'src/constants/enqueue-jobs-max-batch-size.constant';

// a single history webhook can describe thousands of messages
export const enqueueLogicFunctionJobs = async <TPayload extends Record<string, unknown>>({
  logicFunctionUniversalIdentifier,
  payloads,
}: {
  logicFunctionUniversalIdentifier: string;
  payloads: TPayload[];
}) => {
  for (let start = 0; start < payloads.length; start += ENQUEUE_JOBS_MAX_BATCH_SIZE) {
    await enqueueJobs({
      logicFunctionUniversalIdentifier,
      retryLimit: 3,
      delayMs: 500,
      jobs: payloads
        .slice(start, start + ENQUEUE_JOBS_MAX_BATCH_SIZE)
        .map((payload) => ({ payload })),
    });
  }
};
