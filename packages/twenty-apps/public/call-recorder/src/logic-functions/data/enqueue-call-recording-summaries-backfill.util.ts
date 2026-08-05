import { enqueueJob } from 'twenty-sdk/logic-function';

import { BACKFILL_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/backfill-call-recording-summaries-logic-function-universal-identifier';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';

// Runs the summary backfill worker: it discovers recordings missing a summary
// and fans generation out into per-recording jobs.
export const enqueueCallRecordingSummariesBackfill =
  async (): Promise<void> => {
    await enqueueJob({
      logicFunctionUniversalIdentifier:
        BACKFILL_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
    });
  };
