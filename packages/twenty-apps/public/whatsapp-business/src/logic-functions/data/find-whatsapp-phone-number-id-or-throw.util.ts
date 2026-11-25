import { getWhatsAppBusinessAccountIdsOfConnection } from 'src/logic-functions/data/get-whatsapp-business-account-ids-of-connection.util';
import { getWhatsAppBusinessAccountPhoneNumbers } from 'src/logic-functions/data/get-whatsapp-business-account-phone-numbers.util';
import { normalizeWhatsAppPhoneNumber } from 'src/logic-functions/data/normalize-whatsapp-phone-number.util';

// channels are keyed by display phone number, while sending needs Meta's phone number ID
export const findWhatsAppPhoneNumberIdOrThrow = async ({
  accessToken,
  connectedAccountId,
  displayPhoneNumber,
}: {
  accessToken: string;
  connectedAccountId: string;
  displayPhoneNumber: string;
}): Promise<string> => {
  const normalizedDisplayPhoneNumber = normalizeWhatsAppPhoneNumber(displayPhoneNumber);

  for (const whatsAppBusinessAccountId of await getWhatsAppBusinessAccountIdsOfConnection(connectedAccountId)) {
    const phoneNumber = (
      await getWhatsAppBusinessAccountPhoneNumbers({ accessToken, whatsAppBusinessAccountId })
    ).find(
      ({ display_phone_number }) =>
        normalizeWhatsAppPhoneNumber(display_phone_number) === normalizedDisplayPhoneNumber,
    );

    if (phoneNumber !== undefined) {
      return phoneNumber.id;
    }
  }

  throw new Error(`WhatsApp phone number ${displayPhoneNumber} is not part of connection ${connectedAccountId}`);
};
