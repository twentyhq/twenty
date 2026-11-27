import { isDefined } from 'twenty-sdk/utils';

import {
  getLinkedinHistoryImportChatProgress,
  getLinkedinHistoryImportPlanning,
} from 'src/logic-functions/utils/linkedin-history-import-kv.util';
import { scheduleLinkedinHistoryImportChatJob } from 'src/logic-functions/utils/schedule-linkedin-history-import-chat-job.util';

// Contact jobs run one after another: the daily profile lookup count is a KV read then write, which concurrent jobs would race on
export const scheduleNextLinkedinHistoryImportContacts = async ({
  connectedAccountId,
  runId,
  afterChatId,
}: {
  connectedAccountId: string;
  runId: string;
  afterChatId?: string;
}): Promise<void> => {
  const run = { connectedAccountId, runId };
  const { chatIds = [] } = await getLinkedinHistoryImportPlanning(run);
  const startIndex = isDefined(afterChatId)
    ? chatIds.indexOf(afterChatId) + 1
    : 0;

  for (const chatId of chatIds.slice(startIndex)) {
    const progress = await getLinkedinHistoryImportChatProgress({
      ...run,
      chatId,
    });

    if (progress?.status !== 'PENDING' || !isDefined(progress.chat)) {
      continue;
    }

    await scheduleLinkedinHistoryImportChatJob({
      job: {
        kind: 'CONTACTS',
        payload: { connectedAccountId, runId, chat: progress.chat },
      },
    });

    return;
  }
};
