import { type CoreApiClient } from 'twenty-client-sdk/core';

// List form on purpose: the single-record read throws `Record not found` for an unknown id.
export function getCompanyPartnerUser(client: CoreApiClient, companyId: string) {
  return client.query({
    companies: {
      __args: { filter: { id: { eq: companyId } }, first: 1 },
      edges: { node: { id: true, partnerUserId: true } },
    },
  });
}
