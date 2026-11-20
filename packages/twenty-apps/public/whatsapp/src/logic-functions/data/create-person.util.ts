import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';
import { parseWhatsAppPhoneNumber } from 'src/logic-functions/data/parse-whatsapp-phone-number.util';
import { type WhatsAppIdentity } from 'src/logic-functions/types/whatsapp-identity.type';

type CreatePersonParams = WhatsAppIdentity & {
  client: CoreApiClient;
  name?: string;
};

export const createPerson = async ({
  client,
  whatsAppId,
  whatsAppUserId,
  name,
}: CreatePersonParams): Promise<string> => {
  const [firstName = '', ...lastNameParts] = isNonEmptyString(name) ? name.trim().split(/\s+/) : [];
  const phones = isNonEmptyString(whatsAppId) ? parseWhatsAppPhoneNumber(whatsAppId) : undefined;

  const { createPerson: createdPerson } = await client.mutation({
    createPerson: {
      __args: {
        data: {
          ...(isNonEmptyString(whatsAppId) ? { whatsAppId } : {}),
          ...(isNonEmptyString(whatsAppUserId) ? { whatsAppUserId } : {}),
          name: { firstName, lastName: lastNameParts.join(' ') },
          ...(isDefined(phones) ? { phones } : {}),
        },
      },
      id: true,
    },
  });

  return createdPerson.id;
};
