import { type CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';

export function createApplication(
  client: CoreApiClient,
  data: CoreSchema.ApplicationCreateInput,
) {
  return client.mutation({
    createApplication: { __args: { data }, id: true },
  });
}
