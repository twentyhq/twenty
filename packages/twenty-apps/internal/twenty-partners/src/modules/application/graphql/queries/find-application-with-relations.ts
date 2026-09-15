import { type CoreApiClient } from 'twenty-client-sdk/core';

// List form on purpose: the single-record read throws `Record not found` for an unknown id.
export function findApplicationWithRelations(client: CoreApiClient, id: string) {
  return client.query({
    applications: {
      __args: { filter: { id: { eq: id } }, first: 1 },
      edges: {
        node: {
          id: true,
          partner: { name: true },
          opportunity: { name: true },
        },
      },
    },
  });
}
