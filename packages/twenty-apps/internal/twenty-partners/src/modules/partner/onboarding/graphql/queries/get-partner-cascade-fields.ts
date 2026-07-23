import { type CoreApiClient } from 'twenty-client-sdk/core';

// ponytail: single 200-cap page for persons/applications; a partner has a handful of each.
export function getPartnerCascadeFields(client: CoreApiClient, partnerId: string) {
  return client.query({
    partner: {
      __args: { filter: { id: { eq: partnerId } } },
      id: true,
      companyId: true,
      partnerUserId: true,
      persons: { edges: { node: { id: true } } },
    },
    applications: {
      __args: {
        filter: { partnerId: { eq: partnerId }, partnerUserId: { is: 'NULL' } },
        first: 200,
      },
      edges: { node: { id: true } },
    },
  });
}
