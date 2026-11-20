import { defineLogicFunction } from 'twenty-sdk/define';
import { listMessageChannels, type MarkAppThreadAsReadPayload } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { WHATSAPP_LOGIC_FUNCTION_MARK_THREAD_AS_READ_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { findLatestIncomingWhatsAppMessage } from 'src/logic-functions/data/find-latest-incoming-whatsapp-message.util';
import { findWhatsAppPhoneNumberIdOrThrow } from 'src/logic-functions/data/find-whatsapp-phone-number-id-or-throw.util';
import { getWhatsAppAccessTokenOrThrow } from 'src/logic-functions/data/get-whatsapp-access-token-or-throw.util';
import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';

// marking the latest incoming message read marks the earlier ones too, except in groups
const handler = async ({
  connectedAccountId,
  messageChannelId,
  threadExternalId,
}: MarkAppThreadAsReadPayload): Promise<void> => {
  const latestIncomingMessage = await findLatestIncomingWhatsAppMessage({
    messageChannelId,
    threadExternalId,
  });

  if (!isDefined(latestIncomingMessage)) {
    return;
  }

  const messageChannel = (await listMessageChannels({ connectedAccountId })).find(
    ({ id }) => id === messageChannelId,
  );

  if (!isDefined(messageChannel)) {
    throw new Error(`WhatsApp message channel ${messageChannelId} not found`);
  }

  const accessToken = await getWhatsAppAccessTokenOrThrow({ connectedAccountId });

  await whatsAppApiRequest({
    accessToken,
    endpoint: 'POST /{phoneNumberId}/messages',
    pathParams: {
      phoneNumberId: await findWhatsAppPhoneNumberIdOrThrow({
        accessToken,
        connectedAccountId,
        displayPhoneNumber: messageChannel.handle,
      }),
    },
    data: { messaging_product: 'whatsapp', status: 'read', message_id: latestIncomingMessage.externalId },
  });
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_MARK_THREAD_AS_READ_UNIVERSAL_IDENTIFIER,
  name: 'mark-thread-as-read',
  description: 'Marks a WhatsApp conversation opened in Twenty as read, so the customer sees blue ticks',
  timeoutSeconds: 15,
  handler,
});
