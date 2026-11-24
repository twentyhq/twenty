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
  let releasedClaimCount = 0;

  for (const link of links) {
    if (isDefined(link.telegramUserId)) {
      await releaseTelegramUserClaim(link.telegramUserId);
      releasedClaimCount += 1;
    }
  }

  return { releasedClaimCount };
};

export default defineUninstallLogicFunction({
  universalIdentifier: TELEGRAM_UNINSTALL_UNIVERSAL_IDENTIFIER,
  name: 'telegram-uninstall',
  description:
    'Runs when the app is uninstalled, before its metadata is deleted. Releases the server-scoped telegram-user claim of every connected account, so those accounts can be connected from another workspace.',
  timeoutSeconds: 60,
  handler: telegramUninstallHandler,
});
