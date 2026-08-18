import { type CoreApiClient } from 'twenty-client-sdk/core';

export const updateSlackUserLink = async (
  client: CoreApiClient,
  {
    id,
    workspaceMemberId,
    source,
  }: { id: string; workspaceMemberId: string; source?: string },
): Promise<void> => {
  await client.mutation({
    updateSlackUserLink: {
      __args: {
        id,
        data: {
          workspaceMemberId,
          ...(source === undefined ? {} : { source }),
        },
      },
      id: true,
    },
  });
};
