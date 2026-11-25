import { type CoreApiClient } from 'twenty-client-sdk/core';

export const createTelegramUserLink = async ({
  client,
  name,
  telegramUserId,
  telegramUsername,
  workspaceMemberId,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  name: string;
  telegramUserId: string;
  telegramUsername: string;
  workspaceMemberId: string;
}): Promise<void> => {
  await client.mutation({
    createTelegramUserLink: {
      __args: {
        data: { name, telegramUserId, telegramUsername, workspaceMemberId },
      },
      id: true,
    },
  });
};
