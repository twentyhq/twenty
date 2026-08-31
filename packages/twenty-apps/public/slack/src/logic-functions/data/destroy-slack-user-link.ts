import { type CoreApiClient } from 'twenty-client-sdk/core';

// Hard delete: app unique indexes cannot exclude soft-deleted rows, so a
// soft-deleted link would keep its (team, user) tuple and block relinking.
export const destroySlackUserLink = async (
  client: CoreApiClient,
  { id }: { id: string },
): Promise<void> => {
  await client.mutation({
    destroySlackUserLink: {
      __args: { id },
      id: true,
    },
  });
};
