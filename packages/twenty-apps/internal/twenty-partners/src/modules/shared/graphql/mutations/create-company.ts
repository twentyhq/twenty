import type { CoreApiClient } from 'twenty-client-sdk/core';

export function createCompany(client: CoreApiClient, name: string) {
  return client.mutation({
    createCompany: { __args: { data: { name } }, id: true },
  });
}
