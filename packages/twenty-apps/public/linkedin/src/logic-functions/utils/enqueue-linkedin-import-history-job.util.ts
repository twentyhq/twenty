import { enqueueJobs } from 'twenty-sdk/logic-function';

import { LINKEDIN_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinImportHistoryJobPayload } from 'src/logic-functions/types/linkedin-import-history-job-payload.type';

const LINKEDIN_IMPORT_HISTORY_JOB_RETRY_LIMIT = 3;

export const enqueueLinkedinImportHistoryJob = async (
  payload: LinkedinImportHistoryJobPayload,
): Promise<void> => {
  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      LINKEDIN_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER,
    jobs: [
      {
        jobId: `linkedin-import-history-${payload.runId}-${payload.pageIndex}`,
        payload,
      },
    ],
    retryLimit: LINKEDIN_IMPORT_HISTORY_JOB_RETRY_LIMIT,
  });
};
