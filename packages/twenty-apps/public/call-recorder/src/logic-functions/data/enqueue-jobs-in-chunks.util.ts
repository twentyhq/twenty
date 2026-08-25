import { enqueueJobs } from 'twenty-sdk/logic-function';

import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL } from 'src/logic-functions/constants/max-payloads-per-enqueue-jobs-call';

export const enqueueJobsInChunks = async ({
  logicFunctionUniversalIdentifier,
  payloads,
}: {
  logicFunctionUniversalIdentifier: string;
  payloads: Record<string, unknown>[];
}): Promise<void> => {
  for (
    let chunkStart = 0;
    chunkStart < payloads.length;
    chunkStart += MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL
  ) {
    await enqueueJobs({
      logicFunctionUniversalIdentifier,
      payloads: payloads.slice(
        chunkStart,
        chunkStart + MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL,
      ),
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
    });
  }
};
