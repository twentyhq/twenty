import { type CoreApiClient } from 'twenty-client-sdk/core';

// ponytail: applications are capped at 200 (first: 200); persons fetch a single default page.
// A partner has only a handful of each, so neither cap is expected to bind in practice.
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
