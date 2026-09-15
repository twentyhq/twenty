import { type CoreApiClient } from 'twenty-client-sdk/core';

// List form on purpose: the single-record read throws `Record not found` for an unknown id.
export function getPartnerLinkPartnerUser(client: CoreApiClient, id: string) {
  return client
    .query({
      partnerLinks: {
        __args: { filter: { id: { eq: id } }, first: 1 },
        edges: { node: { id: true, partnerUserId: true } },
      },
    })
    .then((res) => res.partnerLinks?.edges?.[0]?.node ?? null);
}

export function getPartnerServicePartnerUser(client: CoreApiClient, id: string) {
  return client
    .query({
      partnerServices: {
        __args: { filter: { id: { eq: id } }, first: 1 },
        edges: { node: { id: true, partnerUserId: true } },
      },
    })
    .then((res) => res.partnerServices?.edges?.[0]?.node ?? null);
}

export function getPartnerContentPartnerUser(client: CoreApiClient, id: string) {
  return client
    .query({
      partnerContents: {
        __args: { filter: { id: { eq: id } }, first: 1 },
        edges: { node: { id: true, partnerUserId: true } },
      },
    })
    .then((res) => res.partnerContents?.edges?.[0]?.node ?? null);
}

export function getApplicationPartnerUser(client: CoreApiClient, id: string) {
  return client
    .query({
      applications: {
        __args: { filter: { id: { eq: id } }, first: 1 },
        edges: { node: { id: true, partnerUserId: true } },
      },
    })
    .then((res) => res.applications?.edges?.[0]?.node ?? null);
}
