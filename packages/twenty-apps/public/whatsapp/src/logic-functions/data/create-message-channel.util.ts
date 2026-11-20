import {
  createMessageChannel,
  listMessageChannels,
  updateMessageChannel,
} from 'twenty-sdk/logic-function';
import { WHATSAPP_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getWhatsAppBusinessAccountPhoneNumbers } from 'src/logic-functions/data/get-whatsapp-business-account-phone-numbers.util';
import { normalizeWhatsAppPhoneNumber } from 'src/logic-functions/data/normalize-whatsapp-phone-number.util';

const WHATSAPP_MESSAGING_PROVIDER = { universalIdentifier: WHATSAPP_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER };

export const createWhatsAppMessageChannels = async ({
  accessToken,
  connectedAccountId,
  whatsAppBusinessAccountIds,
}: {
  accessToken: string;
  connectedAccountId: string;
  whatsAppBusinessAccountIds: string[];
}) => {
  const existingMessageChannels = await listMessageChannels({ connectedAccountId });

  // channels created before replies were supported have no messaging provider yet
  for (const messageChannel of existingMessageChannels) {
    if (messageChannel.messagingProviderUniversalIdentifier !== WHATSAPP_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER) {
      await updateMessageChannel({ id: messageChannel.id, messagingProvider: WHATSAPP_MESSAGING_PROVIDER });
    }
  }

  const existingHandles = new Set(
    existingMessageChannels.map((messageChannel) => normalizeWhatsAppPhoneNumber(messageChannel.handle)),
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
        messagingProvider: WHATSAPP_MESSAGING_PROVIDER,
      });
      existingHandles.add(handle);
    }
  }
};
