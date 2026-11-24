import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineUninstallLogicFunction } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import { TELEGRAM_UNINSTALL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { findTelegramUserLinks } from 'src/logic-functions/data/find-telegram-user-links';
import { releaseTelegramUserClaim } from 'src/logic-functions/utils/release-telegram-user-claim';

export const telegramUninstallHandler = async (): Promise<{
  releasedClaimCount: number;
}> => {
  const links = await findTelegramUserLinks({
    client: new CoreApiClient({ runAs: 'application' }),
  });
  const claimedTelegramUserIds = links
    .map((link) => link.telegramUserId)
    .filter(isDefined);

  for (const telegramUserId of claimedTelegramUserIds) {
    await releaseTelegramUserClaim(telegramUserId);
  }

  return { releasedClaimCount: claimedTelegramUserIds.length };
};

export default defineUninstallLogicFunction({
  universalIdentifier: TELEGRAM_UNINSTALL_UNIVERSAL_IDENTIFIER,
  name: 'telegram-uninstall',
  description:
    'Runs when the app is uninstalled, before its metadata is deleted. Releases the server-scoped telegram-user claim of every connected account, so those accounts can be connected from another workspace.',
  timeoutSeconds: 60,
  handler: telegramUninstallHandler,
});
