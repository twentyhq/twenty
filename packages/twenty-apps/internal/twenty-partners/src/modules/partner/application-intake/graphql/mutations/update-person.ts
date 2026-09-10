import type { CoreApiClient, CoreSchema } from 'twenty-client-sdk/core';

export function updatePerson(
  client: CoreApiClient,
  id: string,
  data: CoreSchema.PersonUpdateInput,
) {
  return client.mutation({
    updatePerson: {
      __args: { id, data },
      id: true,
    },
  });
}
