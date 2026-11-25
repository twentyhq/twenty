import { type CoreApiClient } from 'twenty-client-sdk/core';

export const destroyTelegramUserLink = async ({
  client,
  id,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  id: string;
}): Promise<void> => {
  await client.mutation({
    destroyTelegramUserLink: {
      __args: { id },
      id: true,
    },
  });
};
