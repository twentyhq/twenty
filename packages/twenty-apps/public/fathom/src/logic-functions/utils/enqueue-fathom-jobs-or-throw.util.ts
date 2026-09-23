import { enqueueJobs, type EnqueueJobsInput } from 'twenty-sdk/logic-function';

import { FATHOM_BACKFILL_JOB_RETRY_LIMIT } from 'src/constants/fathom.constant';
import { chunkIntoBatches } from 'src/utils/chunk-into-batches.util';

const MAX_FATHOM_JOBS_PER_ENQUEUE = 200;

export const enqueueFathomJobsOrThrow = async ({
  payloads,
  ...options
}: Pick<EnqueueJobsInput, 'logicFunctionUniversalIdentifier' | 'delayMs'> & {
  payloads: Record<string, unknown>[];
}): Promise<void> => {
  for (const payloadBatch of chunkIntoBatches(
    payloads,
    MAX_FATHOM_JOBS_PER_ENQUEUE,
  )) {
    const enqueueResult = await enqueueJobs({
      ...options,
      payloads: payloadBatch,
      retryLimit: FATHOM_BACKFILL_JOB_RETRY_LIMIT,
    });

    if (!enqueueResult.enqueued) {
      throw new Error(
        `Failed to enqueue Fathom job ${options.logicFunctionUniversalIdentifier}`,
      );
    }
  }
};
