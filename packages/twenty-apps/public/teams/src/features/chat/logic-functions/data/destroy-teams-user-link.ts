import { type CoreApiClient } from 'twenty-client-sdk/core';

export const destroyTeamsUserLink = async ({
  client,
  id,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  id: string;
}): Promise<void> => {
  await client.mutation({
    destroyTeamsUserLink: {
      __args: { id },
      id: true,
    },
  });
};
