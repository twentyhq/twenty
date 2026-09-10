import { type CoreApiClient } from 'twenty-client-sdk/core';

export function deleteApplication(client: CoreApiClient, id: string) {
  return client.mutation({
    deleteApplication: {
      __args: { id },
      id: true,
    },
  });
}
