import { enqueueJobs, type EnqueueJobsInput } from 'twenty-sdk/logic-function';

import { FATHOM_BACKFILL_JOB_RETRY_LIMIT } from 'src/constants/fathom.constant';

// enqueueJobs applies one delayMs to every payload of a call, so each
// staggered batch goes through its own call.
export const enqueueFathomJobOrThrow = async ({
  payload,
  ...options
}: Pick<EnqueueJobsInput, 'logicFunctionUniversalIdentifier' | 'delayMs'> & {
  payload: Record<string, unknown>;
}): Promise<void> => {
  const enqueueResult = await enqueueJobs({
    ...options,
    payloads: [payload],
    retryLimit: FATHOM_BACKFILL_JOB_RETRY_LIMIT,
  });

  if (!enqueueResult.enqueued) {
    throw new Error(
      `Failed to enqueue Fathom job ${options.logicFunctionUniversalIdentifier}`,
    );
  }
};
