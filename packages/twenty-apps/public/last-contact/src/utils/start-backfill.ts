import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  getBackfillBatchSize,
  getBackfillSleepMs,
} from 'src/utils/backfill-settings';
import { enqueueBackfillJobs } from 'src/utils/enqueue-backfill-jobs';

export const startBackfill = async (): Promise<object> => {
  console.log(
    'Backfill params',
    JSON.stringify({
      batchSize: getBackfillBatchSize(),
      sleepMs: getBackfillSleepMs(),
    }),
  );

  const plans = await enqueueBackfillJobs(new CoreApiClient());

  return { outcome: 'enqueued', plans };
};
