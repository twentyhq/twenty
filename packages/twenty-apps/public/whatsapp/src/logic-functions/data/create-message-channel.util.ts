import { createMessageChannel, listMessageChannels } from 'twenty-sdk/logic-function';
import { getWhatsappBusinessAccountPhoneNumbers } from 'src/logic-functions/data/get-whatsapp-business-account-phone-numbers.util';
import { normalizeWhatsappPhoneNumber } from 'src/logic-functions/data/normalize-whatsapp-phone-number.util';

export const createWhatsappMessageChannels = async ({
  connectedAccountId,
  whatsappBusinessAccountId,
}: {
  connectedAccountId: string;
  whatsappBusinessAccountId: string;
}) => {
  const phoneNumbers = await getWhatsappBusinessAccountPhoneNumbers(whatsappBusinessAccountId);
  const existingHandles = new Set(
    (await listMessageChannels({ connectedAccountId })).map((messageChannel) =>
      normalizeWhatsappPhoneNumber(messageChannel.handle),
    ),
  );

  for (const phoneNumber of phoneNumbers) {
    if (existingHandles.has(normalizeWhatsappPhoneNumber(phoneNumber.display_phone_number))) {
      continue;
    }

    await createMessageChannel({
      connectedAccountId,
      handle: phoneNumber.display_phone_number,
      displayName: phoneNumber.verified_name,
      visibility: 'SHARE_EVERYTHING',
    });
  }
};
