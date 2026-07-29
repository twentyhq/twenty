import type { CoreApiClient, CoreSchema } from 'twenty-client-sdk/core';

export function createPerson(
  client: CoreApiClient,
  data: CoreSchema.PersonCreateInput,
) {
  return client.mutation({
    createPerson: {
      __args: { data },
      id: true,
    },
  });
}
