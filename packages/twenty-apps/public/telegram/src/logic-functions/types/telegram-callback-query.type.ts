import { type TelegramUser } from 'src/logic-functions/types/telegram-user.type';

export type TelegramCallbackQuery = {
  id: string;
  from?: TelegramUser;
  data?: string;
};
