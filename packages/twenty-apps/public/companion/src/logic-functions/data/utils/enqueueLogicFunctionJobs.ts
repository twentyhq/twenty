import { enqueueJobs } from 'twenty-sdk/logic-function';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/ENQUEUED_JOB_RETRY_LIMIT';
import { MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL } from 'src/logic-functions/constants/MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL';
import { getBatches } from 'src/logic-functions/utils/getBatches';

const MAX_ENQUEUE_PAYLOADS = 1_000;

export const enqueueLogicFunctionJobs = async ({
  logicFunctionUniversalIdentifier,
  payloads,
}: {
  logicFunctionUniversalIdentifier: string;
  payloads: Record<string, unknown>[];
}): Promise<void> => {
  if (payloads.length > MAX_ENQUEUE_PAYLOADS)
    throw new Error('Cannot enqueue more than 1000 jobs at once.');
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
