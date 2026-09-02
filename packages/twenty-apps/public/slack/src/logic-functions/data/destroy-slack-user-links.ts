import { type CoreApiClient } from 'twenty-client-sdk/core';

const IDS_PER_MUTATION = 200;

export const destroySlackUserLinks = async (
  client: CoreApiClient,
  { ids }: { ids: string[] },
): Promise<void> => {
  for (
    let mutationStart = 0;
    mutationStart < ids.length;
    mutationStart += IDS_PER_MUTATION
  ) {
    await client.mutation({
      destroySlackUserLinks: {
        __args: {
          filter: {
            id: {
              in: ids.slice(mutationStart, mutationStart + IDS_PER_MUTATION),
            },
          },
        },
        id: true,
      },
    });
  }
};
