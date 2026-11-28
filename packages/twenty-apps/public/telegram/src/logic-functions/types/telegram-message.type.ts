import { type TelegramChat } from 'src/logic-functions/types/telegram-chat.type';
import { type TelegramDocument } from 'src/logic-functions/types/telegram-document.type';
import { type TelegramPhotoSize } from 'src/logic-functions/types/telegram-photo-size.type';
import { type TelegramUser } from 'src/logic-functions/types/telegram-user.type';

export type TelegramMessage = {
  message_id: number;
  chat?: TelegramChat;
  from?: TelegramUser;
  text?: string;
  caption?: string;
  photo?: TelegramPhotoSize[];
  document?: TelegramDocument;
};
