import { isDefined } from 'twenty-sdk/utils';

import { type WhatsappHistoryImportChatJob } from 'src/logic-functions/types/whatsapp-history-import-chat-job.type';
import { enqueueWhatsappImportChatContactsJob } from 'src/logic-functions/utils/enqueue-whatsapp-import-chat-contacts-job.util';
import { enqueueWhatsappImportChatMessagesJob } from 'src/logic-functions/utils/enqueue-whatsapp-import-chat-messages-job.util';
import { getActiveWhatsappHistoryImportState } from 'src/logic-functions/utils/get-active-whatsapp-history-import-state.util';
import {
  getWhatsappHistoryImportChatProgress,
  saveWhatsappHistoryImportChatProgress,
} from 'src/logic-functions/utils/whatsapp-history-import-kv.util';

// Saved before enqueuing, so a lost job is spotted and enqueued again when the state is refreshed
export const scheduleWhatsappHistoryImportChatJob = async ({
  job,
  delayMs,
  recoveryCount,
}: {
  job: WhatsappHistoryImportChatJob;
  delayMs?: number;
  recoveryCount?: number;
}): Promise<boolean> => {
  const { connectedAccountId, runId, chat } = job.payload;

  if (!isDefined(await getActiveWhatsappHistoryImportState(job.payload))) {
    return false;
  }

  const chatProgressKey = { connectedAccountId, runId, chatId: chat.id };
  const previousProgress =
    await getWhatsappHistoryImportChatProgress(chatProgressKey);

  await saveWhatsappHistoryImportChatProgress({
    ...chatProgressKey,
    progress: {
      status: 'IMPORTING',
      job,
      recoveryCount: recoveryCount ?? previousProgress?.recoveryCount,
      resumeAt:
        isDefined(delayMs) && delayMs > 0
          ? new Date(Date.now() + delayMs).toISOString()
          : undefined,
    },
  });
  if (job.kind === 'CONTACTS') {
    await enqueueWhatsappImportChatContactsJob({
      payload: job.payload,
      delayMs,
    });
  } else {
    await enqueueWhatsappImportChatMessagesJob({
      payload: job.payload,
      delayMs,
    });
  }

  return true;
};
