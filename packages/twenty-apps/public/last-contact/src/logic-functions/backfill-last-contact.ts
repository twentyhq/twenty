import { CoreApiClient } from 'twenty-client-sdk/core';
import { definePostInstallLogicFunction } from 'twenty-sdk/define';

import { BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  getBackfillBatchSize,
  getBackfillSleepMs,
} from 'src/utils/backfill-settings';
import { enqueueBackfillJobs } from 'src/utils/enqueue-backfill-jobs';

const handler = async (): Promise<object> => {
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

export default definePostInstallLogicFunction({
  universalIdentifier: BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-last-contact',
  description:
    'Counts people, opportunities and companies after installation and enqueues one backfill job per record batch.',
  timeoutSeconds: 300,
  shouldRunOnVersionUpgrade: true,
  handler,
});
