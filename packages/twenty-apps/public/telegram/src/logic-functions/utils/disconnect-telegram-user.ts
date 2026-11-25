import { type CoreApiClient } from 'twenty-client-sdk/core';

import { destroyTelegramUserLink } from 'src/logic-functions/data/destroy-telegram-user-link';
import { findTelegramUserLinks } from 'src/logic-functions/data/find-telegram-user-links';
import { releaseTelegramUserClaim } from 'src/logic-functions/utils/release-telegram-user-claim';

export const disconnectTelegramUser = async ({
  client,
  telegramUserId,
}: {
  client: Pick<CoreApiClient, 'query' | 'mutation'>;
  telegramUserId: string;
}): Promise<void> => {
  const links = await findTelegramUserLinks({
    client,
    filter: { telegramUserId },
  });

  for (const link of links) {
    await destroyTelegramUserLink({ client, id: link.id });
  }

  await releaseTelegramUserClaim(telegramUserId);
};
