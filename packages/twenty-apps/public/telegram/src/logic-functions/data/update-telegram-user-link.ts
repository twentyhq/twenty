import { type CoreApiClient } from 'twenty-client-sdk/core';

export const updateTelegramUserLink = async ({
  client,
  id,
  name,
  telegramUsername,
  workspaceMemberId,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  id: string;
  name: string;
  telegramUsername: string;
  workspaceMemberId: string;
}): Promise<void> => {
  await client.mutation({
    updateTelegramUserLink: {
      __args: { id, data: { name, telegramUsername, workspaceMemberId } },
      id: true,
    },
  });
};
