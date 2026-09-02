import { enqueueJob, type EnqueueJobInput } from 'twenty-sdk/logic-function';

import { FATHOM_BACKFILL_JOB_RETRY_LIMIT } from 'src/constants/fathom.constant';

export const enqueueFathomJobOrThrow = async (
  input: Omit<EnqueueJobInput, 'retryLimit'>,
): Promise<void> => {
  const enqueueResult = await enqueueJob({
    ...input,
    retryLimit: FATHOM_BACKFILL_JOB_RETRY_LIMIT,
  });

  if (!enqueueResult.enqueued) {
    throw new Error(
      `Failed to enqueue Fathom job ${input.logicFunctionUniversalIdentifier}`,
    );
  }
};
