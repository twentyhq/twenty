import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { type WhatsAppIdentity } from 'src/logic-functions/types/whatsapp-identity.type';
import { type WhatsAppPerson } from 'src/logic-functions/types/whatsapp-person.type';

export const findWhatsAppPeople = async ({
  client,
  identities,
}: {
  client: CoreApiClient;
  identities: WhatsAppIdentity[];
}): Promise<WhatsAppPerson[]> => {
  const whatsAppIds = identities.map(({ whatsAppId }) => whatsAppId).filter(isNonEmptyString);
  const whatsAppUserIds = identities
    .map(({ whatsAppUserId }) => whatsAppUserId)
    .filter(isNonEmptyString);

  const filters = [
    ...(whatsAppIds.length > 0 ? [{ whatsAppId: { in: whatsAppIds } }] : []),
    ...(whatsAppUserIds.length > 0 ? [{ whatsAppUserId: { in: whatsAppUserIds } }] : []),
  ];

  if (filters.length === 0) {
    return [];
  }

  const { people } = await client.query({
    people: {
      __args: { filter: { or: filters }, first: whatsAppIds.length + whatsAppUserIds.length },
      edges: { node: { id: true, whatsAppId: true, whatsAppUserId: true } },
    },
  });

  return (people?.edges ?? []).map(({ node }: { node: WhatsAppPerson }) => node);
};
