import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineUninstallLogicFunction } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import { TELEGRAM_UNINSTALL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { findTelegramUserLinks } from 'src/logic-functions/data/find-telegram-user-links';
import { findWorkspaceMemberIds } from 'src/logic-functions/data/find-workspace-member-ids';
import { deletePendingTelegramLinkToken } from 'src/logic-functions/utils/delete-pending-telegram-link-token';
import { releaseTelegramUserClaim } from 'src/logic-functions/utils/release-telegram-user-claim';

export const telegramUninstallHandler = async (): Promise<{
  releasedClaimCount: number;
  deletedPendingLinkTokenCount: number;
}> => {
  const client = new CoreApiClient({ runAs: 'application' });
  const links = await findTelegramUserLinks({ client });
  const claimedTelegramUserIds = links
    .map((link) => link.telegramUserId)
    .filter(isDefined);

  for (const telegramUserId of claimedTelegramUserIds) {
    await releaseTelegramUserClaim(telegramUserId);
  }

  const workspaceMemberIds = await findWorkspaceMemberIds({ client });
  const pendingLinkTokenDeletions: boolean[] = [];

  for (const workspaceMemberId of workspaceMemberIds) {
    pendingLinkTokenDeletions.push(
      await deletePendingTelegramLinkToken(workspaceMemberId),
    );
  }

  return {
    releasedClaimCount: claimedTelegramUserIds.length,
    deletedPendingLinkTokenCount: pendingLinkTokenDeletions.filter(
      (isDeleted) => isDeleted,
    ).length,
  };
};

export default defineUninstallLogicFunction({
  universalIdentifier: TELEGRAM_UNINSTALL_UNIVERSAL_IDENTIFIER,
  name: 'telegram-uninstall',
  description:
    'Runs when the app is uninstalled, before its metadata is deleted. Releases the server-scoped telegram-user claim of every connected account, so those accounts can be connected from another workspace, and the claim of every connection link still pending.',
  timeoutSeconds: 60,
  handler: telegramUninstallHandler,
});
