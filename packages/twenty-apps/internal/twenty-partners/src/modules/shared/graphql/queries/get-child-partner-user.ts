import { type CoreApiClient } from 'twenty-client-sdk/core';

export function getPartnerLinkPartnerUser(client: CoreApiClient, id: string) {
  return client
    .query({ partnerLink: { __args: { filter: { id: { eq: id } } }, id: true, partnerUserId: true } })
    .then((res) => res.partnerLink);
}

export function getPartnerServicePartnerUser(client: CoreApiClient, id: string) {
  return client
    .query({ partnerService: { __args: { filter: { id: { eq: id } } }, id: true, partnerUserId: true } })
    .then((res) => res.partnerService);
}

export function getPartnerContentPartnerUser(client: CoreApiClient, id: string) {
  return client
    .query({ partnerContent: { __args: { filter: { id: { eq: id } } }, id: true, partnerUserId: true } })
    .then((res) => res.partnerContent);
}

export function getApplicationPartnerUser(client: CoreApiClient, id: string) {
  return client
    .query({ application: { __args: { filter: { id: { eq: id } } }, id: true, partnerUserId: true } })
    .then((res) => res.application);
}
