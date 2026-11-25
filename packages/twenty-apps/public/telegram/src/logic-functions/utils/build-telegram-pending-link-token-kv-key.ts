import { TELEGRAM_PENDING_LINK_TOKEN_KV_KEY_PREFIX } from 'src/logic-functions/constants/telegram-pending-link-token-kv-key-prefix';

export const buildTelegramPendingLinkTokenKvKey = (
  workspaceMemberId: string,
): string =>
  `${TELEGRAM_PENDING_LINK_TOKEN_KV_KEY_PREFIX}:${workspaceMemberId}`;
