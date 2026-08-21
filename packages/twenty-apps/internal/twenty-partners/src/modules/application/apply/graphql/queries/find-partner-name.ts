import { type CoreApiClient } from 'twenty-client-sdk/core';

export function findPartnerName(client: CoreApiClient, partnerId: string) {
  return client.query({
    partner: { __args: { filter: { id: { eq: partnerId } } }, id: true, name: true },
  });
}
