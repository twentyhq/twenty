import { type CoreApiClient } from 'twenty-client-sdk/core';

export const deleteSlackUserLink = async (
  client: CoreApiClient,
  { id }: { id: string },
): Promise<void> => {
  await client.mutation({
    deleteSlackUserLink: {
      __args: { id },
      id: true,
    },
  });
};
