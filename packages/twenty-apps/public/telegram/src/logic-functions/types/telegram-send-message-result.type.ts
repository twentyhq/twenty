export type TelegramSendMessageResult =
  | { success: true; messageId: number }
  | { success: false; error: string };
