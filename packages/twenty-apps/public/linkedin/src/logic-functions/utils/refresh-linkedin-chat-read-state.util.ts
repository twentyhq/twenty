import { syncLinkedinChatReadState } from 'src/logic-functions/utils/sync-linkedin-chat-read-state.util';
import { getUnipileChat } from 'src/unipile/utils/get-unipile-chat.util';

export const refreshLinkedinChatReadState = async ({
  unipileAccountId,
  messageChannelId,
  chatId,
}: {
  unipileAccountId: string;
  messageChannelId: string;
  chatId: string;
}): Promise<void> => {
  try {
    await syncLinkedinChatReadState({
      messageChannelId,
      chat: await getUnipileChat({ accountId: unipileAccountId, chatId }),
    });
  } catch (error) {
    // the next chat.update webhook or import reapplies it, so a miss must not fail the import
    console.warn(
      `[linkedin] could not refresh the read state of chat ${chatId}`,
      error,
    );
  }
};
