import { type AppMessageChannel, listMessageChannels } from 'twenty-sdk/logic-function';
import { normalizeWhatsAppPhoneNumber } from 'src/logic-functions/data/normalize-whatsapp-phone-number.util';

export const findMessageChannelByDisplayPhoneNumber = async (
  displayPhoneNumber: string,
): Promise<AppMessageChannel | undefined> => {
  const normalizedDisplayPhoneNumber = normalizeWhatsAppPhoneNumber(displayPhoneNumber);

  const messageChannels = await listMessageChannels();

  return messageChannels.find(
    (messageChannel) =>
      normalizeWhatsAppPhoneNumber(messageChannel.handle) ===
      normalizedDisplayPhoneNumber,
  );
};
