import { isDefined } from 'twenty-sdk/utils';

import { type WhatsappHistoryImportChatProgress } from 'src/logic-functions/types/whatsapp-history-import-chat-progress.type';
import { getActiveWhatsappHistoryImportState } from 'src/logic-functions/utils/get-active-whatsapp-history-import-state.util';
import { saveWhatsappHistoryImportChatProgress } from 'src/logic-functions/utils/whatsapp-history-import-kv.util';

export const finishWhatsappHistoryImportChat = async ({
  connectedAccountId,
  runId,
  chatId,
  status,
  error,
}: {
  connectedAccountId: string;
  runId: string;
  chatId: string;
  status: Exclude<WhatsappHistoryImportChatProgress['status'], 'IMPORTING'>;
  error?: WhatsappHistoryImportChatProgress['error'];
}): Promise<boolean> => {
  if (
    !isDefined(
      await getActiveWhatsappHistoryImportState({
        connectedAccountId,
        runId,
      }),
    )
  ) {
    return false;
  }

  await saveWhatsappHistoryImportChatProgress({
    connectedAccountId,
    runId,
    chatId,
    progress: { status, error },
  });

  return true;
};
