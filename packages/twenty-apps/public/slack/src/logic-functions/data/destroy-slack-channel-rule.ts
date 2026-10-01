import { type CoreApiClient } from 'twenty-client-sdk/core';

export const destroySlackChannelRule = async (
  client: Pick<CoreApiClient, 'mutation'>,
  { id }: { id: string },
): Promise<void> => {
  await client.mutation({
    destroySlackChannelRule: {
      __args: { id },
      id: true,
    },
  });
};
