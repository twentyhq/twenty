import { defineLogicFunction } from 'twenty-sdk/define';
import { getJobs, kv } from 'twenty-sdk/logic-function';

import {
  type BackfillRun,
  type BackfillStatus,
  BACKFILL_RUN_KV_KEY,
  BACKFILL_STATUS_ROUTE_PATH,
  MAX_JOB_IDS_PER_STATUS_READ,
} from 'src/constants/backfill';
import { BACKFILL_STATUS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { chunk } from 'src/utils/chunk';
import {
  getIsBackfillSettled,
  summarizeBackfillJobs,
} from 'src/utils/summarize-backfill-jobs';

const handler = async (): Promise<BackfillStatus> => {
  const run = await kv.get<BackfillRun>(BACKFILL_RUN_KV_KEY);

  if (run === null) {
    return { status: 'idle' };
  }

  if (run.status === 'enqueueing') {
    return { status: 'enqueueing', startedAt: run.startedAt };
  }

  const jobStatuses = [];

  for (const jobIdsPage of chunk(run.jobIds, MAX_JOB_IDS_PER_STATUS_READ)) {
    jobStatuses.push(...(await getJobs(jobIdsPage)));
  }

  const progress = summarizeBackfillJobs({
    jobIds: run.jobIds,
    jobStatuses,
  });

  return {
    status: getIsBackfillSettled(progress) ? 'settled' : 'running',
    startedAt: run.startedAt,
    progress,
  };
};

export default defineLogicFunction({
  universalIdentifier: BACKFILL_STATUS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-status',
  description:
    'Reports the latest last-contact backfill run and the queue state of the batch jobs it enqueued.',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: {
    path: BACKFILL_STATUS_ROUTE_PATH,
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
