import { defineLogicFunction } from 'twenty-sdk/define';
import { enqueueJobs } from 'twenty-sdk/logic-function';

import {
  BACKFILL_ROUTE_PATH,
  BACKFILL_STARTED_OUTCOME,
} from 'src/constants/backfill';
import {
  REQUEST_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  RUN_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { recordBackfillRun } from 'src/utils/record-backfill-run';

// Counting the records and enqueueing one job per batch costs an API round
// trip per batch, so the route hands that off to a background job instead of
// holding the caller's request open for the whole fan-out. The run is recorded
// as enqueueing first, so the status route reports this run rather than the
// progress of the previous one while the fan-out is still running.
const handler = async (): Promise<object> => {
  await recordBackfillRun({
    status: 'enqueueing',
    startedAt: new Date().toISOString(),
  });

  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      RUN_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    payloads: [{}],
  });

  return { outcome: BACKFILL_STARTED_OUTCOME };
};

export default defineLogicFunction({
  universalIdentifier: REQUEST_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'request-backfill',
  description:
    'Enqueues a last-contact backfill over every existing person, opportunity and company.',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: {
    path: BACKFILL_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
