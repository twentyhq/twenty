import { type TelegramUpdate } from 'src/logic-functions/types/telegram-update.type';

export type TelegramUpdatesDispatchPayload = {
  update: TelegramUpdate;
};
