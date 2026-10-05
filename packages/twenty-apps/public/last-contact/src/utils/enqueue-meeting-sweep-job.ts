import { enqueueJobs } from 'twenty-sdk/logic-function';

import { MEETING_JOB_RETRY_LIMIT } from 'src/constants/meeting-schedule';
import { MEETING_SWEEP_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { executeWithRetry } from 'src/utils/execute-with-retry';

export const enqueueMeetingSweepJob = async (delayMs: number): Promise<void> => {
  await executeWithRetry(() =>
    enqueueJobs({
      logicFunctionUniversalIdentifier:
        MEETING_SWEEP_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      jobs: [{ payload: {} }],
      delayMs: Math.round(delayMs),
      retryLimit: MEETING_JOB_RETRY_LIMIT,
    }),
  );
};
