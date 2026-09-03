import { enqueueJobs } from 'twenty-sdk/logic-function';

import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL } from 'src/logic-functions/constants/max-payloads-per-enqueue-jobs-call';
import { getBatches } from 'src/logic-functions/utils/get-batches.util';

export const enqueueLogicFunctionJobs = async ({
  logicFunctionUniversalIdentifier,
  payloads,
}: {
  logicFunctionUniversalIdentifier: string;
  payloads: Record<string, unknown>[];
}): Promise<void> => {
  for (const payloadChunk of getBatches(
    payloads,
    MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL,
  )) {
    await enqueueJobs({
      logicFunctionUniversalIdentifier,
      payloads: payloadChunk,
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
    });
  }
};
