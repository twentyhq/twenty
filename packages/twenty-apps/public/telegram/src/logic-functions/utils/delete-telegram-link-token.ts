import { kv } from 'twenty-sdk/logic-function';

import { buildTelegramLinkTokenKvKey } from 'src/logic-functions/utils/build-telegram-link-token-kv-key';

export const deleteTelegramLinkToken = async (
  tokenHash: string,
): Promise<void> => {
  const key = buildTelegramLinkTokenKvKey(tokenHash);

  await kv.delete(key);
  await kv.delete(key, { scope: 'SERVER' });
};
