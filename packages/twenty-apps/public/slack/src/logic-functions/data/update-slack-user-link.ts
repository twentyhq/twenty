import { type CoreApiClient } from 'twenty-client-sdk/core';

export const updateSlackUserLink = async (
  client: CoreApiClient,
  { id, workspaceMemberId }: { id: string; workspaceMemberId: string },
): Promise<void> => {
  await client.mutation({
    updateSlackUserLink: {
      __args: {
        id,
        data: { workspaceMemberId },
      },
      id: true,
    },
  });
};
