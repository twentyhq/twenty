import { type TelegramAssistantFeedback } from 'src/logic-functions/types/telegram-assistant-feedback.type';
import { type TelegramInboundAttachment } from 'src/logic-functions/types/telegram-inbound-attachment.type';
import { type TelegramUser } from 'src/logic-functions/types/telegram-user.type';

export type TelegramInboundEvent =
  | { kind: 'LINK_START'; chatId: number; user: TelegramUser; token: string }
  | { kind: 'DISCONNECT'; chatId: number; user: TelegramUser }
  | {
      kind: 'MESSAGE';
      chatId: number;
      user: TelegramUser;
      messageId: number;
      text: string;
      attachment: TelegramInboundAttachment | undefined;
    }
  | {
      kind: 'FEEDBACK';
      user: TelegramUser;
      callbackQueryId: string;
      requestId: string;
      feedback: TelegramAssistantFeedback;
    }
  | { kind: 'BLOCKED'; user: TelegramUser };
