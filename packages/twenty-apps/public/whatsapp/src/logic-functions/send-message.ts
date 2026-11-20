import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  listMessageChannels,
  type SendAppMessagePayload,
  type SendAppMessageResult,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { WHATSAPP_LOGIC_FUNCTION_SEND_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildWhatsAppMediaMessage } from 'src/logic-functions/data/build-whatsapp-media-message.util';
import { buildWhatsAppMessageTarget } from 'src/logic-functions/data/build-whatsapp-message-target.util';
import { findWhatsAppPhoneNumberIdOrThrow } from 'src/logic-functions/data/find-whatsapp-phone-number-id-or-throw.util';
import { getWhatsAppAccessTokenOrThrow } from 'src/logic-functions/data/get-whatsapp-access-token-or-throw.util';
import { uploadWhatsAppMedia } from 'src/logic-functions/data/upload-whatsapp-media.util';
import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';
import { type WhatsAppReplyContent } from 'src/logic-functions/types/whatsapp-reply-content.type';

const handler = async ({
  connectedAccountId,
  messageChannelId,
  threadExternalId,
  text,
  attachments,
}: SendAppMessagePayload): Promise<SendAppMessageResult> => {
  const messageChannel = (await listMessageChannels({ connectedAccountId })).find(
    ({ id }) => id === messageChannelId,
  );

  if (!isDefined(messageChannel)) {
    throw new Error(`WhatsApp message channel ${messageChannelId} not found`);
  }

  const accessToken = await getWhatsAppAccessTokenOrThrow({ connectedAccountId });
  const phoneNumberId = await findWhatsAppPhoneNumberIdOrThrow({
    accessToken,
    connectedAccountId,
    displayPhoneNumber: messageChannel.handle,
  });
  const target = buildWhatsAppMessageTarget(threadExternalId);

  // WhatsApp has no message with both text and several files, so each part is its own message
  const send = async (content: WhatsAppReplyContent) => {
    const response = await whatsAppApiRequest({
      accessToken,
      endpoint: 'POST /{phoneNumberId}/messages',
      pathParams: { phoneNumberId },
      data: { messaging_product: 'whatsapp', ...target, ...content },
    });

    const messageId = 'messages' in response ? response.messages[0]?.id : undefined;

    if (!isNonEmptyString(messageId)) {
      throw new Error('WhatsApp accepted the message without returning its ID');
    }

    return messageId;
  };

  const messageIds: string[] = [];

  if (isNonEmptyString(text.trim())) {
    messageIds.push(await send({ type: 'text', text: { body: text } }));
  }

  for (const attachment of attachments) {
    const mediaId = await uploadWhatsAppMedia({ accessToken, phoneNumberId, attachment });

    messageIds.push(
      await send(
        buildWhatsAppMediaMessage({
          mediaId,
          contentType: attachment.contentType,
          filename: attachment.filename,
        }),
      ),
    );
  }

  const [externalId] = messageIds;

  if (!isDefined(externalId)) {
    throw new Error('A WhatsApp reply needs text or an attachment');
  }

  return { externalId };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'send-message',
  description:
    'Sends a reply written in Twenty, with its attachments, to its WhatsApp conversation. Outside the 24 hour customer service window WhatsApp only delivers templates.',
  timeoutSeconds: 60,
  handler,
});
