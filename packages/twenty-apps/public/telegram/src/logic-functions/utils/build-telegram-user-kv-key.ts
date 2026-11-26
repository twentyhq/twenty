import { TELEGRAM_USER_KV_KEY_PREFIX } from 'src/logic-functions/constants/telegram-user-kv-key-prefix';

export const buildTelegramUserKvKey = (telegramUserId: string): string =>
  `${TELEGRAM_USER_KV_KEY_PREFIX}:${telegramUserId}`;
