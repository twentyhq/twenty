import { getWhatsappBusinessAccountIdsOrThrow } from 'src/logic-functions/data/get-whatsapp-business-account-ids-or-throw.util';
import { getWhatsappBusinessAccountPhoneNumbers } from 'src/logic-functions/data/get-whatsapp-business-account-phone-numbers.util';

export const getDefaultWhatsappPhoneNumberIdOrThrow = async ({
  accessToken,
}: {
  accessToken: string;
}): Promise<string> => {
  const { whatsappBusinessAccountIds } = await getWhatsappBusinessAccountIdsOrThrow({ accessToken });
  const phoneNumbers = (
    await Promise.all(
      whatsappBusinessAccountIds.map((whatsappBusinessAccountId) =>
        getWhatsappBusinessAccountPhoneNumbers({ accessToken, whatsappBusinessAccountId }),
      ),
    )
  ).flat();
  const [phoneNumber, ...otherPhoneNumbers] = phoneNumbers;

  if (phoneNumber === undefined) {
    throw new Error('The connected WhatsApp Business Accounts have no phone number');
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
