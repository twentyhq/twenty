import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { findOrCreateWhatsAppMessageChannelOrThrow } from 'src/logic-functions/data/find-or-create-whatsapp-message-channel-or-throw.util';
import { findOrCreateWhatsAppPersonId } from 'src/logic-functions/data/find-or-create-whatsapp-person-id.util';
import { resolveWhatsAppThreadExternalId } from 'src/logic-functions/data/resolve-whatsapp-thread-external-id.util';
import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';
import { type WhatsAppConversation } from 'src/logic-functions/types/whatsapp-conversation.type';
import { type WhatsAppIdentity } from 'src/logic-functions/types/whatsapp-identity.type';
import { type WhatsAppPerson } from 'src/logic-functions/types/whatsapp-person.type';

// the conversation in Twenty that a message sent from a business phone number to a recipient belongs to
export const resolveWhatsAppConversationOrThrow = async ({
  accessToken,
  whatsAppBusinessAccountId,
  phoneNumberId,
  recipientIdentity,
}: {
  accessToken: string;
  whatsAppBusinessAccountId: string;
  phoneNumberId: string;
  recipientIdentity: WhatsAppIdentity;
}): Promise<WhatsAppConversation> => {
  const { display_phone_number } = await whatsAppApiRequest({
    accessToken,
    endpoint: 'GET /{phoneNumberId}',
    pathParams: { phoneNumberId },
    query: { fields: 'display_phone_number' },
  });
  const messageChannel = await findOrCreateWhatsAppMessageChannelOrThrow({
    whatsAppBusinessAccountId,
    displayPhoneNumber: display_phone_number,
  });

  const client = new CoreApiClient();
  const personId = await findOrCreateWhatsAppPersonId({ client, identity: recipientIdentity });
  const { person } = await client.query({
    person: {
      __args: { filter: { id: { eq: personId } } },
      id: true,
      whatsAppId: true,
      whatsAppUserId: true,
    },
  });
  const knownPerson: WhatsAppPerson | undefined = person ?? undefined;

  // the person record may know the user ID even when the message goes to a phone number
  const customerIdentity: WhatsAppIdentity = {
    whatsAppId: knownPerson?.whatsAppId ?? recipientIdentity.whatsAppId,
    whatsAppUserId: knownPerson?.whatsAppUserId ?? recipientIdentity.whatsAppUserId,
  };
  const customerHandle = [customerIdentity.whatsAppId, customerIdentity.whatsAppUserId].find(isNonEmptyString);
  const threadExternalId = await resolveWhatsAppThreadExternalId({
    messageChannelId: messageChannel.id,
    customerIdentity,
  });

  if (!isNonEmptyString(customerHandle) || !isNonEmptyString(threadExternalId)) {
    throw new Error('The WhatsApp recipient has no phone number or user ID');
  }

  return { messageChannel, personId, customerHandle, threadExternalId };
};
