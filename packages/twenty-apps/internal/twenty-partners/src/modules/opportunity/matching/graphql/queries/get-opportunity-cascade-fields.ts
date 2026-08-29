import type { CoreApiClient } from 'twenty-client-sdk/core';

// List form on purpose: the single-record read throws `Record not found` for an unknown id.
export function getOpportunityCascadeFields(client: CoreApiClient, opportunityId: string) {
  return client.query({
    opportunities: {
      __args: { filter: { id: { eq: opportunityId } }, first: 1 },
      edges: { node: { id: true, partnerUserId: true, companyId: true } },
    },
  });
}
