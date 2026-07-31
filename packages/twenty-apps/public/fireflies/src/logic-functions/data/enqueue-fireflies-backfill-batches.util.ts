import { enqueueJob } from 'twenty-sdk/logic-function';

import { FIREFLIES_BACKFILL_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/fireflies-backfill-batch-logic-function-universal-identifier.constant';
import { FIREFLIES_BACKFILL_BATCH_RETRY_LIMIT } from 'src/logic-functions/constants/fireflies-backfill-batch-retry-limit.constant';
import { FIREFLIES_BACKFILL_BATCH_STAGGER_MILLISECONDS } from 'src/logic-functions/constants/fireflies-backfill-batch-stagger-milliseconds.constant';

export const enqueueFirefliesBackfillBatches = async ({
  transcriptIdBatches,
}: {
  transcriptIdBatches: string[][];
}): Promise<number> => {
  const enqueueResults = await Promise.allSettled(
    transcriptIdBatches.map((transcriptIds, batchIndex) =>
      enqueueJob({
        logicFunctionUniversalIdentifier:
          FIREFLIES_BACKFILL_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        payload: { transcriptIds },
        retryLimit: FIREFLIES_BACKFILL_BATCH_RETRY_LIMIT,
        ...(batchIndex === 0
          ? {}
          : {
              delayMs:
                batchIndex * FIREFLIES_BACKFILL_BATCH_STAGGER_MILLISECONDS,
            }),
      }),
    ),
  );

  for (const enqueueResult of enqueueResults) {
    if (enqueueResult.status === 'rejected') {
      console.error(
        `[fireflies] backfill batch enqueue failed: ${
          enqueueResult.reason instanceof Error
            ? enqueueResult.reason.message
            : String(enqueueResult.reason)
        }`,
      );
    }
  }

  return enqueueResults.filter(
    (enqueueResult) => enqueueResult.status === 'fulfilled',
  ).length;
};
