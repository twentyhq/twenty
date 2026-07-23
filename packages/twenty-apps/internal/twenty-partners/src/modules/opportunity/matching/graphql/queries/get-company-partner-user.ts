import type { CoreApiClient } from 'twenty-client-sdk/core';

export function getCompanyPartnerUser(client: CoreApiClient, companyId: string) {
  return client.query({
    company: {
      __args: { filter: { id: { eq: companyId } } },
      id: true,
      partnerUserId: true,
    },
  });
}
