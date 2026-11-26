import { type TelegramChatMemberUpdated } from 'src/logic-functions/types/telegram-chat-member-updated.type';
import { type TelegramMessage } from 'src/logic-functions/types/telegram-message.type';

export type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
  my_chat_member?: TelegramChatMemberUpdated;
};
