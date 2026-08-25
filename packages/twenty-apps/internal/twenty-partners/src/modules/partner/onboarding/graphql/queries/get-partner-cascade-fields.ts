import { type CoreApiClient } from 'twenty-client-sdk/core';

// ponytail: applications are capped at 200 (first: 200); persons fetch a single default page.
// A partner has only a handful of each, so neither cap is expected to bind in practice.
// List form on purpose: the single-record read throws `Record not found` for an unknown id.
export function getPartnerCascadeFields(client: CoreApiClient, partnerId: string) {
  return client.query({
    partners: {
      __args: { filter: { id: { eq: partnerId } }, first: 1 },
      edges: {
        node: {
          id: true,
          companyId: true,
          partnerUserId: true,
          persons: { edges: { node: { id: true, partnerUserId: true } } },
        },
      },
    },
    applications: {
      __args: {
        filter: { partnerId: { eq: partnerId }, partnerUserId: { is: 'NULL' } },
        first: 200,
      },
      edges: { node: { id: true } },
    },
    partnerLinks: {
      __args: {
        filter: { partnerId: { eq: partnerId }, partnerUserId: { is: 'NULL' } },
        first: 200,
      },
      edges: { node: { id: true } },
    },
    partnerServices: {
      __args: {
        filter: { partnerId: { eq: partnerId }, partnerUserId: { is: 'NULL' } },
        first: 200,
      },
      edges: { node: { id: true } },
    },
    partnerContents: {
      __args: {
        filter: { partnerId: { eq: partnerId }, partnerUserId: { is: 'NULL' } },
        first: 200,
      },
      edges: { node: { id: true } },
    },
  });
}
