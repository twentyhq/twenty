import { getDefaultWhatsAppBusinessAccountIdOrThrow } from 'src/logic-functions/data/get-default-whatsapp-business-account-id-or-throw.util';
import { getDefaultWhatsAppPhoneNumberIdOrThrow } from 'src/logic-functions/data/get-default-whatsapp-phone-number-id-or-throw.util';
import { getWhatsAppAccessTokenOrThrow } from 'src/logic-functions/data/get-whatsapp-access-token-or-throw.util';

// falls back to the only connected account and phone number when they are not given
export const resolveWhatsAppSenderOrThrow = async ({
  whatsAppBusinessAccountId,
  phoneNumberId,
}: {
  whatsAppBusinessAccountId?: string;
  phoneNumberId?: string;
}) => {
  const senderWhatsAppBusinessAccountId =
    whatsAppBusinessAccountId ?? (await getDefaultWhatsAppBusinessAccountIdOrThrow());
  const accessToken = await getWhatsAppAccessTokenOrThrow({
    whatsAppBusinessAccountId: senderWhatsAppBusinessAccountId,
  });

  return {
    whatsAppBusinessAccountId: senderWhatsAppBusinessAccountId,
    accessToken,
    phoneNumberId:
      phoneNumberId ??
      (await getDefaultWhatsAppPhoneNumberIdOrThrow({
        accessToken,
        whatsAppBusinessAccountId: senderWhatsAppBusinessAccountId,
      })),
  };
};
