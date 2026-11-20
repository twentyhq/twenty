import { createMessageChannel, listMessageChannels } from 'twenty-sdk/logic-function';
import { getWhatsappBusinessAccountPhoneNumbers } from 'src/logic-functions/data/get-whatsapp-business-account-phone-numbers.util';
import { normalizeWhatsappPhoneNumber } from 'src/logic-functions/data/normalize-whatsapp-phone-number.util';

export const createWhatsappMessageChannels = async ({
  accessToken,
  connectedAccountId,
  whatsappBusinessAccountIds,
}: {
  accessToken: string;
  connectedAccountId: string;
  whatsappBusinessAccountIds: string[];
}) => {
  const existingHandles = new Set(
    (await listMessageChannels({ connectedAccountId })).map((messageChannel) =>
      normalizeWhatsappPhoneNumber(messageChannel.handle),
    ),
  );

  for (const whatsappBusinessAccountId of whatsappBusinessAccountIds) {
    const phoneNumbers = await getWhatsappBusinessAccountPhoneNumbers({
      accessToken,
      whatsappBusinessAccountId,
    });

    for (const phoneNumber of phoneNumbers) {
      const handle = normalizeWhatsappPhoneNumber(phoneNumber.display_phone_number);

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
