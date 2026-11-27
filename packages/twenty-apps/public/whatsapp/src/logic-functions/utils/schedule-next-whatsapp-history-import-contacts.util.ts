import { isDefined } from 'twenty-sdk/utils';

import {
  getWhatsappHistoryImportChatProgress,
  getWhatsappHistoryImportPlanning,
} from 'src/logic-functions/utils/whatsapp-history-import-kv.util';
import { scheduleWhatsappHistoryImportChatJob } from 'src/logic-functions/utils/schedule-whatsapp-history-import-chat-job.util';

// Contact jobs run one after another: people are found then created by phone, so two jobs sharing a member would both create it
export const scheduleNextWhatsappHistoryImportContacts = async ({
  connectedAccountId,
  runId,
  afterChatId,
}: {
  connectedAccountId: string;
  runId: string;
  afterChatId?: string;
}): Promise<void> => {
  const run = { connectedAccountId, runId };
  const { chatIds = [] } = await getWhatsappHistoryImportPlanning(run);
  const startIndex = isDefined(afterChatId)
    ? chatIds.indexOf(afterChatId) + 1
    : 0;

  for (const chatId of chatIds.slice(startIndex)) {
    const progress = await getWhatsappHistoryImportChatProgress({
      ...run,
      chatId,
    });

    // Already handed over, by an earlier attempt of the same job
    if (progress?.status === 'IMPORTING' && progress.job?.kind === 'CONTACTS') {
      return;
    }

    if (progress?.status !== 'PENDING' || !isDefined(progress.chat)) {
      continue;
    }

    await scheduleWhatsappHistoryImportChatJob({
      job: {
        kind: 'CONTACTS',
        payload: { connectedAccountId, runId, chat: progress.chat },
      },
    });

    return;
  }
};
