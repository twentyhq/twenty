import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { getUnipileChat } from 'src/unipile/utils/get-unipile-chat.util';
import { UnipileRequestError } from 'src/unipile/utils/request-unipile.util';
import { sortUnipileChatsByLastMessage } from 'src/unipile/utils/sort-unipile-chats-by-last-message.util';

const UNIPILE_NOT_FOUND_STATUS = 404;

// A selected conversation deleted on LinkedIn since is skipped, not a reason to fail the run
export const listSelectedLinkedinChats = async ({
  unipileAccountId,
  selectedChatIds,
}: {
  unipileAccountId: string;
  selectedChatIds: string[];
}): Promise<UnipileChat[]> => {
  const chats: UnipileChat[] = [];

  for (const chatId of selectedChatIds) {
    try {
      chats.push(await getUnipileChat({ accountId: unipileAccountId, chatId }));
    } catch (error) {
      if (
        !(error instanceof UnipileRequestError) ||
        error.status !== UNIPILE_NOT_FOUND_STATUS
      ) {
        throw error;
      }
    }
  }

  return sortUnipileChatsByLastMessage(chats);
};
