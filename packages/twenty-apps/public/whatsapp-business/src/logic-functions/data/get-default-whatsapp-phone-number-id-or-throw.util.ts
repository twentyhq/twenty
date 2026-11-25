import { getWhatsAppBusinessAccountPhoneNumbers } from 'src/logic-functions/data/get-whatsapp-business-account-phone-numbers.util';

export const getDefaultWhatsAppPhoneNumberIdOrThrow = async ({
  accessToken,
  whatsAppBusinessAccountId,
}: {
  accessToken: string;
  whatsAppBusinessAccountId: string;
}): Promise<string> => {
  const phoneNumbers = await getWhatsAppBusinessAccountPhoneNumbers({
    accessToken,
    whatsAppBusinessAccountId,
  });
  const [phoneNumber, ...otherPhoneNumbers] = phoneNumbers;

  if (phoneNumber === undefined) {
    throw new Error(`WhatsApp Business Account ${whatsAppBusinessAccountId} has no phone number`);
  }

  if (otherPhoneNumbers.length > 0) {
    throw new Error(
      `Several WhatsApp phone numbers are connected, pass the ID of one of: ${phoneNumbers
        .map(({ id, display_phone_number }) => `${display_phone_number} (${id})`)
        .join(', ')}`,
    );
  }

  return phoneNumber.id;
};
