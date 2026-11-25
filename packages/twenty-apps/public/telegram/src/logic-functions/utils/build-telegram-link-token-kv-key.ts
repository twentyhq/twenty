import { TELEGRAM_LINK_TOKEN_KV_KEY_PREFIX } from 'src/logic-functions/constants/telegram-link-token-kv-key-prefix';

export const buildTelegramLinkTokenKvKey = (tokenHash: string): string =>
  `${TELEGRAM_LINK_TOKEN_KV_KEY_PREFIX}:${tokenHash}`;
