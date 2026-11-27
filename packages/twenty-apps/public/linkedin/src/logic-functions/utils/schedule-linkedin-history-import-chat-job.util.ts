import { isDefined } from 'twenty-sdk/utils';

import { type LinkedinHistoryImportChatJob } from 'src/logic-functions/types/linkedin-history-import-chat-job.type';
import { enqueueLinkedinImportChatContactsJob } from 'src/logic-functions/utils/enqueue-linkedin-import-chat-contacts-job.util';
import { enqueueLinkedinImportChatMessagesJob } from 'src/logic-functions/utils/enqueue-linkedin-import-chat-messages-job.util';
import { getActiveLinkedinHistoryImportState } from 'src/logic-functions/utils/get-active-linkedin-history-import-state.util';
import {
  getLinkedinHistoryImportChatProgress,
  saveLinkedinHistoryImportChatProgress,
} from 'src/logic-functions/utils/linkedin-history-import-kv.util';

// Saved before enqueuing, so a lost job is spotted and enqueued again when the state is refreshed
export const scheduleLinkedinHistoryImportChatJob = async ({
  job,
  delayMs,
  recoveryCount,
}: {
  job: LinkedinHistoryImportChatJob;
  delayMs?: number;
  recoveryCount?: number;
}): Promise<boolean> => {
  const { connectedAccountId, runId, chat } = job.payload;

  if (!isDefined(await getActiveLinkedinHistoryImportState(job.payload))) {
    return false;
  }

  const chatProgressKey = { connectedAccountId, runId, chatId: chat.id };
  const previousProgress =
    await getLinkedinHistoryImportChatProgress(chatProgressKey);

  await saveLinkedinHistoryImportChatProgress({
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
    await enqueueLinkedinImportChatContactsJob({
      payload: job.payload,
      delayMs,
    });
  } else {
    await enqueueLinkedinImportChatMessagesJob({
      payload: job.payload,
      delayMs,
    });
  }

  return true;
};
