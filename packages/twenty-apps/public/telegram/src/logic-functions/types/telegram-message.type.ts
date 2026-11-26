import { type TelegramChat } from 'src/logic-functions/types/telegram-chat.type';
import { type TelegramUser } from 'src/logic-functions/types/telegram-user.type';

export type TelegramMessage = {
  message_id: number;
  chat?: TelegramChat;
  from?: TelegramUser;
  text?: string;
};
