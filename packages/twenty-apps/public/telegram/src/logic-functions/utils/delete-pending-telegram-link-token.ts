import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { buildTelegramPendingLinkTokenKvKey } from 'src/logic-functions/utils/build-telegram-pending-link-token-kv-key';
import { deleteTelegramLinkToken } from 'src/logic-functions/utils/delete-telegram-link-token';

export const deletePendingTelegramLinkToken = async (
  workspaceMemberId: string,
): Promise<boolean> => {
  const pendingKey = buildTelegramPendingLinkTokenKvKey(workspaceMemberId);
  const tokenHash = await kv.get<string>(pendingKey);

  if (!isNonEmptyString(tokenHash)) {
    return false;
  }

  await deleteTelegramLinkToken(tokenHash);
  await kv.delete(pendingKey);

  return true;
};
