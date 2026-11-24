import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { kv } from 'twenty-sdk/logic-function';

import { doesWorkspaceMemberExist } from 'src/logic-functions/data/does-workspace-member-exist';
import { type TelegramPendingLinkToken } from 'src/logic-functions/types/telegram-pending-link-token.type';
import { type TelegramUser } from 'src/logic-functions/types/telegram-user.type';
import { buildTelegramLinkTokenKvKey } from 'src/logic-functions/utils/build-telegram-link-token-kv-key';
import { claimTelegramUser } from 'src/logic-functions/utils/claim-telegram-user';
import { deleteTelegramLinkToken } from 'src/logic-functions/utils/delete-telegram-link-token';
import { hashTelegramLinkToken } from 'src/logic-functions/utils/hash-telegram-link-token';
import { persistTelegramUserLink } from 'src/logic-functions/utils/persist-telegram-user-link';

export const completeTelegramUserLink = async ({
  client,
  user,
  token,
  workspaceId,
}: {
  client: Pick<CoreApiClient, 'query' | 'mutation'>;
  user: TelegramUser;
  token: string;
  workspaceId: string;
}): Promise<'LINKED' | 'LINK_EXPIRED' | 'LINK_CONFLICT'> => {
  const tokenHash = hashTelegramLinkToken(token);
  const pendingToken = await kv.get<TelegramPendingLinkToken>(
    buildTelegramLinkTokenKvKey(tokenHash),
  );
  const workspaceMemberId = pendingToken?.workspaceMemberId;

  if (
    !isNonEmptyString(workspaceMemberId) ||
    !isNumber(pendingToken?.expiresAtMs) ||
    pendingToken.expiresAtMs < Date.now() ||
    !(await doesWorkspaceMemberExist({ client, workspaceMemberId }))
  ) {
    await deleteTelegramLinkToken(tokenHash);

    return 'LINK_EXPIRED';
  }

  // The token is kept on a conflict so the same link works once the user has
  // sent /disconnect to the workspace holding the account.
  if (
    !(await claimTelegramUser({ telegramUserId: `${user.id}`, workspaceId }))
  ) {
    return 'LINK_CONFLICT';
  }

  await persistTelegramUserLink({ client, user, workspaceMemberId });

  // Deleted last so a retried run finds the token and links again, instead of
  // telling a user who is now linked that the link expired.
  await deleteTelegramLinkToken(tokenHash);

  return 'LINKED';
};
