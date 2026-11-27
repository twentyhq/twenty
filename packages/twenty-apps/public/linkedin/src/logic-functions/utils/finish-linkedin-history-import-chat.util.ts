import { type LinkedinHistoryImportChatProgress } from 'src/logic-functions/types/linkedin-history-import-chat-progress.type';
import { getActiveLinkedinHistoryImportState } from 'src/logic-functions/utils/get-active-linkedin-history-import-state.util';
import { saveLinkedinHistoryImportChatProgress } from 'src/logic-functions/utils/linkedin-history-import-kv.util';

export const finishLinkedinHistoryImportChat = async ({
  connectedAccountId,
  runId,
  chatId,
  status,
  error,
}: {
  connectedAccountId: string;
  runId: string;
  chatId: string;
  status: Exclude<LinkedinHistoryImportChatProgress['status'], 'IMPORTING'>;
  error?: LinkedinHistoryImportChatProgress['error'];
}): Promise<boolean> => {
  if (
    (await getActiveLinkedinHistoryImportState({
      connectedAccountId,
      runId,
    })) === null
  ) {
    return false;
  }

  await saveLinkedinHistoryImportChatProgress({
    connectedAccountId,
    runId,
    chatId,
    progress: { status, error },
  });

  return true;
};
