import type { CoreApiClient } from 'twenty-client-sdk/core';

export function updateApplicationState(client: CoreApiClient, id: string, state: string) {
  return client.mutation({
    updateApplication: { __args: { id, data: { state } }, id: true },
  });
}
