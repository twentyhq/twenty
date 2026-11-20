import { type AppMessageChannel, listMessageChannels } from 'twenty-sdk/logic-function';
import { normalizeWhatsappPhoneNumber } from 'src/logic-functions/data/normalize-whatsapp-phone-number.util';

export const findMessageChannelByDisplayPhoneNumber = async (
  displayPhoneNumber: string,
): Promise<AppMessageChannel | undefined> => {
  const normalizedDisplayPhoneNumber = normalizeWhatsappPhoneNumber(displayPhoneNumber);

  const messageChannels = await listMessageChannels();

  return messageChannels.find(
    (messageChannel) =>
      normalizeWhatsappPhoneNumber(messageChannel.handle) ===
      normalizedDisplayPhoneNumber,
  );
};
