import { getWhatsappBusinessAccountPhoneNumbers } from 'src/logic-functions/data/get-whatsapp-business-account-phone-numbers.util';

export const getDefaultWhatsappPhoneNumberIdOrThrow = async ({
  accessToken,
  whatsappBusinessAccountId,
}: {
  accessToken: string;
  whatsappBusinessAccountId: string;
}): Promise<string> => {
  const phoneNumbers = await getWhatsappBusinessAccountPhoneNumbers({
    accessToken,
    whatsappBusinessAccountId,
  });
  const [phoneNumber, ...otherPhoneNumbers] = phoneNumbers;

  if (phoneNumber === undefined) {
    throw new Error(`WhatsApp Business Account ${whatsappBusinessAccountId} has no phone number`);
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
