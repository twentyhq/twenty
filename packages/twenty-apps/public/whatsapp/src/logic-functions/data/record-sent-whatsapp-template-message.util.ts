import { CoreApiClient } from 'twenty-client-sdk/core';
import { ingestMessages } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { buildWhatsAppThreadExternalId } from 'src/logic-functions/data/build-whatsapp-thread-external-id.util';
import { findOrCreateWhatsAppMessageChannelOrThrow } from 'src/logic-functions/data/find-or-create-whatsapp-message-channel-or-throw.util';
import { findOrCreateWhatsAppPersonId } from 'src/logic-functions/data/find-or-create-whatsapp-person-id.util';
import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';
import { type WhatsAppIdentity } from 'src/logic-functions/types/whatsapp-identity.type';
import { type WhatsAppPerson } from 'src/logic-functions/types/whatsapp-person.type';

export const recordSentWhatsAppTemplateMessage = async ({
  accessToken,
  whatsAppBusinessAccountId,
  phoneNumberId,
  messageId,
  recipientIdentity,
  text,
}: {
  accessToken: string;
  whatsAppBusinessAccountId: string;
  phoneNumberId: string;
  messageId: string;
  recipientIdentity: WhatsAppIdentity;
  text: string;
}) => {
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

  // prefer what the person record knows, so the template joins the thread of their incoming messages
  const customerIdentity: WhatsAppIdentity = {
    whatsAppId: knownPerson?.whatsAppId ?? recipientIdentity.whatsAppId,
    whatsAppUserId: knownPerson?.whatsAppUserId ?? recipientIdentity.whatsAppUserId,
  };
  const customerHandle = customerIdentity.whatsAppId ?? customerIdentity.whatsAppUserId;
  const threadExternalId = buildWhatsAppThreadExternalId({ customerIdentity });

  if (!isDefined(customerHandle) || !isDefined(threadExternalId)) {
    throw new Error(`WhatsApp template message ${messageId} has no recipient identifier`);
  }

  await ingestMessages({
    messageChannelId: messageChannel.id,
    messages: [
      {
        externalId: messageId,
        threadExternalId,
        text,
        receivedAt: new Date(),
        participants: [
          { role: 'FROM', handle: messageChannel.handle },
          { role: 'TO', handle: customerHandle, personId },
        ],
      },
    ],
  });
};
