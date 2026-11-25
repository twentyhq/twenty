import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';
import { createPerson } from 'src/logic-functions/data/create-person.util';
import { findPersonByPhoneNumber } from 'src/logic-functions/data/find-person-by-phone-number.util';
import { findPersonForWhatsAppIdentity } from 'src/logic-functions/data/find-person-for-whatsapp-identity.util';
import { findWhatsAppPeople } from 'src/logic-functions/data/find-whatsapp-people.util';
import { type WhatsAppIdentity } from 'src/logic-functions/types/whatsapp-identity.type';

export const findOrCreateWhatsAppPersonId = async ({
  client,
  identity,
  name,
}: {
  client: CoreApiClient;
  identity: WhatsAppIdentity;
  name?: string;
}): Promise<string> => {
  const people = await findWhatsAppPeople({ client, identities: [identity] });
  const person =
    findPersonForWhatsAppIdentity({ people, identity }) ??
    (isNonEmptyString(identity.whatsAppId)
      ? await findPersonByPhoneNumber({ client, phoneNumber: identity.whatsAppId })
      : undefined);

  if (!isDefined(person)) {
    return createPerson({ client, ...identity, name });
  }

  const isWhatsAppIdMissing =
    isNonEmptyString(identity.whatsAppId) &&
    !isNonEmptyString(person.whatsAppId) &&
    !people.some(({ whatsAppId }) => whatsAppId === identity.whatsAppId);
  const isWhatsAppUserIdMissing =
    isNonEmptyString(identity.whatsAppUserId) &&
    !isNonEmptyString(person.whatsAppUserId) &&
    !people.some(({ whatsAppUserId }) => whatsAppUserId === identity.whatsAppUserId);

  if (isWhatsAppIdMissing || isWhatsAppUserIdMissing) {
    await client.mutation({
      updatePerson: {
        __args: {
          id: person.id,
          data: {
            ...(isWhatsAppIdMissing ? { whatsAppId: identity.whatsAppId } : {}),
            ...(isWhatsAppUserIdMissing ? { whatsAppUserId: identity.whatsAppUserId } : {}),
          },
        },
        id: true,
      },
    });
  }

  return person.id;
};
