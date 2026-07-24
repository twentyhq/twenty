import { type CoreApiClient } from 'twenty-client-sdk/core';

export function findApplicationWithRelations(client: CoreApiClient, id: string) {
  return client.query({
    application: {
      __args: { filter: { id: { eq: id } } },
      id: true,
      partner: { name: true },
      opportunity: { name: true },
    },
  });
}
