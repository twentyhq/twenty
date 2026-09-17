import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  getBackfillBatchSize,
  getBackfillSleepMs,
} from 'src/utils/backfill-settings';
import { enqueueBackfillJobs } from 'src/utils/enqueue-backfill-jobs';
import { recordBackfillRun } from 'src/utils/record-backfill-run';

export const startBackfill = async (): Promise<object> => {
  console.log(
    'Backfill params',
    JSON.stringify({
      batchSize: getBackfillBatchSize(),
      sleepMs: getBackfillSleepMs(),
    }),
  );

  const { plans, jobIds } = await enqueueBackfillJobs(new CoreApiClient());

  await recordBackfillRun({
    status: 'enqueued',
    startedAt: new Date().toISOString(),
    jobIds,
    plans,
  });

  return { outcome: 'enqueued', plans };
};
