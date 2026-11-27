import { enqueueJobs } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_HISTORY_IMPORT_CONTACTS_JOB_LIMITER } from 'src/constants/linkedin-history-import-contacts-job-limiter.constant';
import { LINKEDIN_HISTORY_IMPORT_MESSAGES_JOB_LIMITER } from 'src/constants/linkedin-history-import-messages-job-limiter.constant';
import {
  LINKEDIN_IMPORT_CHAT_CONTACTS_UNIVERSAL_IDENTIFIER,
  LINKEDIN_IMPORT_CHAT_MESSAGES_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type LinkedinHistoryImportChatJob } from 'src/logic-functions/types/linkedin-history-import-chat-job.type';
import { getLinkedinHistoryImportChatJobId } from 'src/logic-functions/utils/get-linkedin-history-import-job-id.util';

const LINKEDIN_HISTORY_IMPORT_CHAT_JOB_RETRY_LIMIT = 3;

const MAX_JOBS_PER_ENQUEUE = 200;

const JOB_CONFIG_BY_KIND = {
  CONTACTS: {
    logicFunctionUniversalIdentifier:
      LINKEDIN_IMPORT_CHAT_CONTACTS_UNIVERSAL_IDENTIFIER,
    limiter: LINKEDIN_HISTORY_IMPORT_CONTACTS_JOB_LIMITER,
  },
  MESSAGES: {
    logicFunctionUniversalIdentifier:
      LINKEDIN_IMPORT_CHAT_MESSAGES_UNIVERSAL_IDENTIFIER,
    limiter: LINKEDIN_HISTORY_IMPORT_MESSAGES_JOB_LIMITER,
  },
} as const;

// The queue accepts either a delay or a limiter, so a delayed job skips the limiter
export const enqueueLinkedinHistoryImportChatJobs = async ({
  jobs,
  delayMs,
}: {
  jobs: LinkedinHistoryImportChatJob[];
  delayMs?: number;
}): Promise<void> => {
  for (const kind of ['CONTACTS', 'MESSAGES'] as const) {
    const jobsOfKind = jobs.filter((job) => job.kind === kind);
    const { logicFunctionUniversalIdentifier, limiter } =
      JOB_CONFIG_BY_KIND[kind];

    for (
      let batchStart = 0;
      batchStart < jobsOfKind.length;
      batchStart += MAX_JOBS_PER_ENQUEUE
    ) {
      await enqueueJobs({
        logicFunctionUniversalIdentifier,
        jobs: jobsOfKind
          .slice(batchStart, batchStart + MAX_JOBS_PER_ENQUEUE)
          .map((job) => ({
            jobId: getLinkedinHistoryImportChatJobId(job),
            payload: job.payload,
          })),
        retryLimit: LINKEDIN_HISTORY_IMPORT_CHAT_JOB_RETRY_LIMIT,
        ...(isDefined(delayMs) && delayMs > 0 ? { delayMs } : { limiter }),
      });
    }
  }
};
