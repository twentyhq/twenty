import type { CoreApiClient } from 'twenty-client-sdk/core';

export function findPartnerForEmbed(client: CoreApiClient, id: string) {
  return client.query({
    partner: {
      __args: { filter: { id: { eq: id } } },
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
  });
}
