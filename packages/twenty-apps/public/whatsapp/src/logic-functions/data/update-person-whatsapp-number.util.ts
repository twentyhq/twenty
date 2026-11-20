import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';
import { findPersonIdsByWhatsappIds } from 'src/logic-functions/data/find-person-ids-by-whatsapp-ids.util';
import { parseWhatsappPhoneNumber } from 'src/logic-functions/data/parse-whatsapp-phone-number.util';

export const updatePersonWhatsappNumber = async ({
  client,
  previousWhatsAppId,
  whatsAppId,
}: {
  client: CoreApiClient;
  previousWhatsAppId: string;
  whatsAppId: string;
}) => {
  const personId = (
    await findPersonIdsByWhatsappIds({ client, whatsAppIds: [previousWhatsAppId] })
  ).get(previousWhatsAppId);

  if (!isDefined(personId)) {
    return;
  }

  const phones = parseWhatsappPhoneNumber(whatsAppId);

  await client.mutation({
    updatePerson: {
      __args: {
        id: personId,
        data: { whatsAppId, ...(isDefined(phones) ? { phones } : {}) },
      },
      id: true,
    },
  });
};
