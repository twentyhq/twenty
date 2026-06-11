import { CoreApiClient } from 'twenty-client-sdk/core';

export const deleteCallRecording = async (
  client: CoreApiClient,
  id: string,
): Promise<void> => {
  await client.mutation({
    deleteCallRecording: {
      __args: {
        id,
      },
      id: true,
    },
  });
};
