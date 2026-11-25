import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { createTelegramUserLink } from 'src/logic-functions/data/create-telegram-user-link';
import { findTelegramUserLinks } from 'src/logic-functions/data/find-telegram-user-links';
import { updateTelegramUserLink } from 'src/logic-functions/data/update-telegram-user-link';
import { type TelegramUser } from 'src/logic-functions/types/telegram-user.type';
import { formatTelegramUserName } from 'src/logic-functions/utils/format-telegram-user-name';

export const persistTelegramUserLink = async ({
  client,
  user,
  workspaceMemberId,
}: {
  client: Pick<CoreApiClient, 'query' | 'mutation'>;
  user: TelegramUser;
  workspaceMemberId: string;
}): Promise<void> => {
  const telegramUserId = `${user.id}`;
  const fields = {
    name: formatTelegramUserName(user),
    telegramUsername: user.username ?? '',
    workspaceMemberId,
  };

  const [existingLink] = await findTelegramUserLinks({
    client,
    filter: { telegramUserId },
  });

  if (isDefined(existingLink)) {
    await updateTelegramUserLink({ client, id: existingLink.id, ...fields });

    return;
  }

  await createTelegramUserLink({ client, telegramUserId, ...fields });
};
