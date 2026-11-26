import { type TelegramChat } from 'src/logic-functions/types/telegram-chat.type';
import { type TelegramUser } from 'src/logic-functions/types/telegram-user.type';

export type TelegramChatMemberUpdated = {
  chat?: TelegramChat;
  from?: TelegramUser;
  new_chat_member?: { status?: string };
};
