import { enqueueJobs } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { WHATSAPP_HISTORY_IMPORT_CHAT_JOB_RETRY_LIMIT } from 'src/constants/whatsapp-history-import-chat-job-retry-limit.constant';
import { WHATSAPP_HISTORY_IMPORT_MESSAGES_JOB_LIMITER } from 'src/constants/whatsapp-history-import-messages-job-limiter.constant';
import { WHATSAPP_IMPORT_CHAT_MESSAGES_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type WhatsappImportChatMessagesJobPayload } from 'src/logic-functions/types/whatsapp-import-chat-messages-job-payload.type';
import { getWhatsappHistoryImportChatJobId } from 'src/logic-functions/utils/get-whatsapp-history-import-job-id.util';

export const enqueueWhatsappImportChatMessagesJob = async ({
  payload,
  delayMs,
}: {
  payload: WhatsappImportChatMessagesJobPayload;
  delayMs?: number;
}): Promise<void> => {
  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      WHATSAPP_IMPORT_CHAT_MESSAGES_UNIVERSAL_IDENTIFIER,
    jobs: [
      {
        jobId: getWhatsappHistoryImportChatJobId({ kind: 'MESSAGES', payload }),
        payload,
      },
    ],
    retryLimit: WHATSAPP_HISTORY_IMPORT_CHAT_JOB_RETRY_LIMIT,
    ...(isDefined(delayMs) && delayMs > 0
      ? { delayMs }
      : { limiter: WHATSAPP_HISTORY_IMPORT_MESSAGES_JOB_LIMITER }),
  });
};
