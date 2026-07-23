import type { CoreApiClient } from 'twenty-client-sdk/core';

export function updateCompanyPartnerUser(
  client: CoreApiClient,
  companyId: string,
  partnerUserId: string | null,
) {
  return client.mutation({
    updateCompany: { __args: { id: companyId, data: { partnerUserId } }, id: true },
  });
}
