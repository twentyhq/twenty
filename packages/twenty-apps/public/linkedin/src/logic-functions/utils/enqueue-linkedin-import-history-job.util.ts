import { enqueueJobs } from 'twenty-sdk/logic-function';

import { LINKEDIN_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinImportHistoryJobPayload } from 'src/logic-functions/types/linkedin-import-history-job-payload.type';
import { getLinkedinImportHistoryJobId } from 'src/logic-functions/utils/get-linkedin-history-import-job-id.util';

const LINKEDIN_IMPORT_HISTORY_RETRY_LIMIT = 3;

export const enqueueLinkedinImportHistoryJob = async (
  payload: LinkedinImportHistoryJobPayload,
): Promise<void> => {
  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      LINKEDIN_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER,
    jobs: [{ jobId: getLinkedinImportHistoryJobId(payload), payload }],
    retryLimit: LINKEDIN_IMPORT_HISTORY_RETRY_LIMIT,
  });
};
