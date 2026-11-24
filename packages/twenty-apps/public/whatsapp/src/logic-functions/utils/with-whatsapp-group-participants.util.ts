import { isNonEmptyArray } from '@sniptt/guards';

import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { listUnipileChatParticipants } from 'src/unipile/utils/list-unipile-chat-participants.util';

// Unipile does not always return the members of a group with the chat itself
export const withWhatsappGroupParticipants = async ({
  unipileAccountId,
  chat,
  deadlineAtMs,
}: {
  unipileAccountId: string;
  chat: UnipileChat;
  deadlineAtMs?: number;
}): Promise<UnipileChat> => {
  if (!chat.is_group || isNonEmptyArray(chat.participants)) {
    return chat;
  }

  return {
    ...chat,
    participants: await listUnipileChatParticipants({
      accountId: unipileAccountId,
      chatId: chat.id,
      deadlineAtMs,
    }),
  };
};
