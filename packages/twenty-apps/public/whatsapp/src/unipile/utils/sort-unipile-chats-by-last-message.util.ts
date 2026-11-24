import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

export const sortUnipileChatsByLastMessage = (
  chats: UnipileChat[],
): UnipileChat[] =>
  [...chats].sort((chat, otherChat) =>
    (otherChat.last_message_timestamp ?? '').localeCompare(
      chat.last_message_timestamp ?? '',
    ),
  );
