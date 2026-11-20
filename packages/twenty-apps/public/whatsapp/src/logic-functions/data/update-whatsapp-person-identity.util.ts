import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';
import { findPersonForWhatsAppIdentity } from 'src/logic-functions/data/find-person-for-whatsapp-identity.util';
import { findWhatsAppPeople } from 'src/logic-functions/data/find-whatsapp-people.util';
import { parseWhatsAppPhoneNumber } from 'src/logic-functions/data/parse-whatsapp-phone-number.util';
import { type WhatsAppIdentity } from 'src/logic-functions/types/whatsapp-identity.type';

export const updateWhatsAppPersonIdentity = async ({
  client,
  previousIdentity,
  identity,
}: {
  client: CoreApiClient;
  previousIdentity: WhatsAppIdentity;
  identity: WhatsAppIdentity;
}) => {
  if (!isNonEmptyString(identity.whatsAppId) && !isNonEmptyString(identity.whatsAppUserId)) {
    return;
  }

  const people = await findWhatsAppPeople({ client, identities: [previousIdentity, identity] });
  const person = findPersonForWhatsAppIdentity({ people, identity: previousIdentity });

  if (!isDefined(person)) {
    return;
  }

  const { whatsAppId, whatsAppUserId } = identity;

  // numbers get recycled and the field is unique, so the identity moves away from its previous holder
  for (const previousHolder of people) {
    const holdsWhatsAppId = isNonEmptyString(whatsAppId) && previousHolder.whatsAppId === whatsAppId;
    const holdsWhatsAppUserId =
      isNonEmptyString(whatsAppUserId) && previousHolder.whatsAppUserId === whatsAppUserId;

    if (previousHolder.id === person.id || (!holdsWhatsAppId && !holdsWhatsAppUserId)) {
      continue;
    }

    await client.mutation({
      updatePerson: {
        __args: {
          id: previousHolder.id,
          data: {
            ...(holdsWhatsAppId ? { whatsAppId: null } : {}),
            ...(holdsWhatsAppUserId ? { whatsAppUserId: null } : {}),
          },
        },
        id: true,
      },
    });
  }

  const phones = isNonEmptyString(whatsAppId) ? parseWhatsAppPhoneNumber(whatsAppId) : undefined;

  await client.mutation({
    updatePerson: {
      __args: {
        id: person.id,
        data: {
          ...(isNonEmptyString(whatsAppId) ? { whatsAppId } : {}),
          ...(isNonEmptyString(whatsAppUserId) ? { whatsAppUserId } : {}),
          ...(isDefined(phones) ? { phones } : {}),
        },
      },
      id: true,
    },
  });
};
