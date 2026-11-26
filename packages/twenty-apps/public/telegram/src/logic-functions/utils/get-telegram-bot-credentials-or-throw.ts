import { type TelegramBotCredentials } from 'src/logic-functions/types/telegram-bot-credentials.type';
import { getTelegramBotCredentials } from 'src/logic-functions/utils/get-telegram-bot-credentials';

export const getTelegramBotCredentialsOrThrow = (): TelegramBotCredentials => {
  const result = getTelegramBotCredentials();

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.credentials;
};
