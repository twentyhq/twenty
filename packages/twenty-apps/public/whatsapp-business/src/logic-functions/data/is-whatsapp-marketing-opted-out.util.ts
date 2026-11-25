import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { type WhatsAppIdentity } from 'src/logic-functions/types/whatsapp-identity.type';

export const isWhatsAppMarketingOptedOut = async (identity: WhatsAppIdentity): Promise<boolean> => {
  const identityFilters = [
    ...(isNonEmptyString(identity.whatsAppId) ? [{ whatsAppId: { eq: identity.whatsAppId } }] : []),
    ...(isNonEmptyString(identity.whatsAppUserId)
      ? [{ whatsAppUserId: { eq: identity.whatsAppUserId } }]
      : []),
  ];

  if (identityFilters.length === 0) {
    return false;
  }

  const { people } = await new CoreApiClient().query({
    people: {
      __args: {
        filter: { and: [{ or: identityFilters }, { whatsAppMarketingOptOut: { eq: true } }] },
        first: 1,
      },
      edges: { node: { id: true } },
    },
  });

  return (people?.edges.length ?? 0) > 0;
};
