import type { CoreApiClient, CoreSchema } from 'twenty-client-sdk/core';

export function createCompany(
  client: CoreApiClient,
  data: CoreSchema.CompanyCreateInput,
) {
  return client.mutation({
    createCompany: { __args: { data }, id: true },
  });
}
