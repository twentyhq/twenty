import { listMessageChannels } from 'twenty-sdk/logic-function';
import { normalizeWhatsappPhoneNumber } from 'src/logic-functions/data/normalize-whatsapp-phone-number.util';

export const findMessageChannelIdByDisplayPhoneNumber = async (
  displayPhoneNumber: string,
): Promise<string | undefined> => {
  const normalizedDisplayPhoneNumber = normalizeWhatsappPhoneNumber(displayPhoneNumber);

  const messageChannels = await listMessageChannels();

  return messageChannels.find(
    (messageChannel) =>
      normalizeWhatsappPhoneNumber(messageChannel.handle) ===
      normalizedDisplayPhoneNumber,
  )?.id;
};
