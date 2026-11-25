import { type TelegramBotCredentials } from 'src/logic-functions/types/telegram-bot-credentials.type';

export type TelegramBotCredentialsResult =
  | { success: true; credentials: TelegramBotCredentials }
  | { success: false; error: string };
