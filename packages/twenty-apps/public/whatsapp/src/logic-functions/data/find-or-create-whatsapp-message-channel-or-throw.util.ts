import { type AppMessageChannel } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { createWhatsAppMessageChannels } from 'src/logic-functions/data/create-message-channel.util';
import { findConnectedAccountIdByWhatsAppBusinessAccountId } from 'src/logic-functions/data/find-connected-account-id-by-whatsapp-business-account-id.util';
import { findMessageChannelByDisplayPhoneNumber } from 'src/logic-functions/data/find-message-channel-by-display-phone-number.util';
import { getWhatsAppAccessTokenOrThrow } from 'src/logic-functions/data/get-whatsapp-access-token-or-throw.util';

// phone numbers can be added to the account after it was connected
export const findOrCreateWhatsAppMessageChannelOrThrow = async ({
  whatsAppBusinessAccountId,
  displayPhoneNumber,
}: {
  whatsAppBusinessAccountId: string;
  displayPhoneNumber: string;
}): Promise<AppMessageChannel> => {
  const existingMessageChannel = await findMessageChannelByDisplayPhoneNumber(displayPhoneNumber);

  if (isDefined(existingMessageChannel)) {
    return existingMessageChannel;
  }

  const connectedAccountId =
    await findConnectedAccountIdByWhatsAppBusinessAccountId(whatsAppBusinessAccountId);

  if (!isDefined(connectedAccountId)) {
    throw new Error(`WhatsApp Business Account ${whatsAppBusinessAccountId} is not connected`);
  }

  await createWhatsAppMessageChannels({
    accessToken: await getWhatsAppAccessTokenOrThrow({ connectedAccountId }),
    connectedAccountId,
    whatsAppBusinessAccountIds: [whatsAppBusinessAccountId],
  });

  const createdMessageChannel = await findMessageChannelByDisplayPhoneNumber(displayPhoneNumber);

  if (!isDefined(createdMessageChannel)) {
    throw new Error(
      `No WhatsApp message channel for ${displayPhoneNumber} in account ${whatsAppBusinessAccountId}`,
    );
  }

  return createdMessageChannel;
};
