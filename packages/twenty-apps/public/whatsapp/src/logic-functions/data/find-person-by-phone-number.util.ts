import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';
import { parseWhatsAppPhoneNumber } from 'src/logic-functions/data/parse-whatsapp-phone-number.util';
import { type WhatsAppPerson } from 'src/logic-functions/types/whatsapp-person.type';

// only people not yet linked to WhatsApp, so a recycled number never steals someone else's record
export const findPersonByPhoneNumber = async ({
  client,
  phoneNumber,
}: {
  client: CoreApiClient;
  phoneNumber: string;
}): Promise<WhatsAppPerson | undefined> => {
  const phones = parseWhatsAppPhoneNumber(phoneNumber);

  if (!isDefined(phones)) {
    return undefined;
  }

  const { people } = await client.query({
    people: {
      __args: {
        filter: {
          and: [
            { phones: { primaryPhoneNumber: { eq: phones.primaryPhoneNumber } } },
            { phones: { primaryPhoneCallingCode: { eq: phones.primaryPhoneCallingCode } } },
            { or: [{ whatsAppId: { is: 'NULL' } }, { whatsAppId: { eq: '' } }] },
          ],
        },
        first: 1,
      },
      edges: { node: { id: true, whatsAppId: true, whatsAppUserId: true } },
    },
  });

  return people?.edges[0]?.node ?? undefined;
};
