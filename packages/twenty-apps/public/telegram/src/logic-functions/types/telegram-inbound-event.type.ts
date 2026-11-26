import { type TelegramUser } from 'src/logic-functions/types/telegram-user.type';

export type TelegramInboundEvent =
  | { kind: 'LINK_START'; chatId: number; user: TelegramUser; token: string }
  | { kind: 'DISCONNECT'; chatId: number; user: TelegramUser }
  | { kind: 'MESSAGE'; chatId: number; user: TelegramUser }
  | { kind: 'BLOCKED'; user: TelegramUser };
