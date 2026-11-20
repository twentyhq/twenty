import { createMessageChannel, listMessageChannels } from 'twenty-sdk/logic-function';
import { getWhatsAppBusinessAccountPhoneNumbers } from 'src/logic-functions/data/get-whatsapp-business-account-phone-numbers.util';
import { normalizeWhatsAppPhoneNumber } from 'src/logic-functions/data/normalize-whatsapp-phone-number.util';

export const createWhatsAppMessageChannels = async ({
  accessToken,
  connectedAccountId,
  whatsAppBusinessAccountIds,
}: {
  accessToken: string;
  connectedAccountId: string;
  whatsAppBusinessAccountIds: string[];
}) => {
  const existingHandles = new Set(
    (await listMessageChannels({ connectedAccountId })).map((messageChannel) =>
      normalizeWhatsAppPhoneNumber(messageChannel.handle),
    ),
  );

  for (const whatsAppBusinessAccountId of whatsAppBusinessAccountIds) {
    const phoneNumbers = await getWhatsAppBusinessAccountPhoneNumbers({
      accessToken,
      whatsAppBusinessAccountId,
    });

    for (const phoneNumber of phoneNumbers) {
      const handle = normalizeWhatsAppPhoneNumber(phoneNumber.display_phone_number);

      if (existingHandles.has(handle)) {
        continue;
      }

      await createMessageChannel({
        connectedAccountId,
        handle: phoneNumber.display_phone_number,
        displayName: phoneNumber.verified_name,
        visibility: 'SHARE_EVERYTHING',
      });
      existingHandles.add(handle);
    }
  }
};
