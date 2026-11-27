import { enqueueJobs } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_HISTORY_IMPORT_CHAT_JOB_RETRY_LIMIT } from 'src/constants/linkedin-history-import-chat-job-retry-limit.constant';
import { LINKEDIN_HISTORY_IMPORT_MESSAGES_JOB_LIMITER } from 'src/constants/linkedin-history-import-messages-job-limiter.constant';
import { LINKEDIN_IMPORT_CHAT_MESSAGES_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinImportChatMessagesJobPayload } from 'src/logic-functions/types/linkedin-import-chat-messages-job-payload.type';
import { getLinkedinHistoryImportChatJobId } from 'src/logic-functions/utils/get-linkedin-history-import-job-id.util';

export const enqueueLinkedinImportChatMessagesJob = async ({
  payload,
  delayMs,
}: {
  payload: LinkedinImportChatMessagesJobPayload;
  delayMs?: number;
}): Promise<void> => {
  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      LINKEDIN_IMPORT_CHAT_MESSAGES_UNIVERSAL_IDENTIFIER,
    jobs: [
      {
        jobId: getLinkedinHistoryImportChatJobId({ kind: 'MESSAGES', payload }),
        payload,
      },
    ],
    retryLimit: LINKEDIN_HISTORY_IMPORT_CHAT_JOB_RETRY_LIMIT,
    ...(isDefined(delayMs) && delayMs > 0
      ? { delayMs }
      : { limiter: LINKEDIN_HISTORY_IMPORT_MESSAGES_JOB_LIMITER }),
  });
};
