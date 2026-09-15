import type { CoreApiClient } from 'twenty-client-sdk/core';

// List form on purpose: the single-record read throws `Record not found` for an unknown id.
export function findPartnerForEmbed(client: CoreApiClient, id: string) {
  return client.query({
    partners: {
      __args: { filter: { id: { eq: id } }, first: 1 },
      edges: {
        node: {
          id: true,
          name: true,
          country: true,
          partnerScope: true,
          skills: true,
          languagesSpoken: true,
          persons: {
            edges: {
              node: {
                name: { firstName: true, lastName: true },
              },
            },
          },
        },
      },
    },
  });
}
