import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { callUnipileApi } from 'src/unipile/utils/call-unipile-api.util';

export const getUnipileChat = ({
  accountId,
  chatId,
}: {
  accountId: string;
  chatId: string;
}): Promise<UnipileChat> =>
  callUnipileApi<UnipileChat>({
    method: 'GET',
    path: `/${encodeURIComponent(accountId)}/chats/${encodeURIComponent(chatId)}`,
  });
