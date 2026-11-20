import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';
import { parseWhatsappPhoneNumber } from 'src/logic-functions/data/parse-whatsapp-phone-number.util';

type CreatePersonParams = {
  client: CoreApiClient;
  whatsAppId: string;
  phoneNumber?: string;
  name?: string;
};

export const createPerson = async ({
  client,
  whatsAppId,
  phoneNumber,
  name,
}: CreatePersonParams): Promise<string> => {
  const [firstName = '', ...lastNameParts] = isNonEmptyString(name) ? name.trim().split(/\s+/) : [];
  const phones = isNonEmptyString(phoneNumber) ? parseWhatsappPhoneNumber(phoneNumber) : undefined;

  const { createPerson: createdPerson } = await client.mutation({
    createPerson: {
      __args: {
        data: {
          whatsAppId,
          name: { firstName, lastName: lastNameParts.join(' ') },
          ...(isDefined(phones) ? { phones } : {}),
        },
      },
      id: true,
    },
  });

  return createdPerson.id;
};
