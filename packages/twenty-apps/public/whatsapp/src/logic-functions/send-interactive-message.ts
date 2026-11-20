import { isNonEmptyString } from '@sniptt/guards';
import { z } from 'zod';
import { defineLogicFunction } from 'twenty-sdk/define';
import { type InputJsonSchema } from 'twenty-sdk/logic-function';
import { WHATSAPP_LOGIC_FUNCTION_SEND_INTERACTIVE_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildWhatsAppInteractiveContent } from 'src/logic-functions/data/build-whatsapp-interactive-content.util';
import { buildWhatsAppRecipient } from 'src/logic-functions/data/build-whatsapp-recipient.util';
import { findLatestIncomingWhatsAppMessage } from 'src/logic-functions/data/find-latest-incoming-whatsapp-message.util';
import { formatWhatsAppInteractiveText } from 'src/logic-functions/data/format-whatsapp-interactive-text.util';
import { getRecipientWhatsAppIdentity } from 'src/logic-functions/data/get-recipient-whatsapp-identity.util';
import { ingestSentWhatsAppMessage } from 'src/logic-functions/data/ingest-sent-whatsapp-message.util';
import { isWithinWhatsAppCustomerServiceWindow } from 'src/logic-functions/data/is-within-whatsapp-customer-service-window.util';
import { resolveWhatsAppConversationOrThrow } from 'src/logic-functions/data/resolve-whatsapp-conversation-or-throw.util';
import { resolveWhatsAppSenderOrThrow } from 'src/logic-functions/data/resolve-whatsapp-sender-or-throw.util';
import { sendInteractiveMessageParamsSchema } from 'src/logic-functions/data/send-interactive-message-params.schema';
import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';

const OPTION_ID_PROPERTY = { type: 'string', description: 'Returned with the customer reply. Defaults to option-<n>.' } as const;

const SEND_INTERACTIVE_MESSAGE_INPUT_SCHEMA: InputJsonSchema = {
  type: 'object',
  properties: {
    to: {
      type: 'string',
      label: 'Recipient',
      description: 'Recipient phone number in international format, or their WhatsApp user ID.',
    },
    whatsAppBusinessAccountId: {
      type: 'string',
      label: 'WhatsApp Business Account ID',
      description: 'Optional when only one account is connected.',
    },
    phoneNumberId: {
      type: 'string',
      label: 'Phone number ID',
      description: 'Meta ID of the business phone number to send from. Optional when the account has one number.',
    },
    header: { type: 'string', label: 'Header', description: 'Optional text header, up to 60 characters.' },
    body: { type: 'string', label: 'Body', description: 'Message text, up to 1024 characters.' },
    footer: { type: 'string', label: 'Footer', description: 'Optional footer, up to 60 characters.' },
    buttons: {
      type: 'array',
      label: 'Reply buttons',
      description: 'Up to 3 buttons with titles of up to 20 characters. Pass either buttons or a list.',
      items: {
        type: 'object',
        properties: { id: OPTION_ID_PROPERTY, title: { type: 'string' } },
        required: ['title'],
      },
    },
    list: {
      type: 'object',
      label: 'List',
      description:
        'A menu opened by a button (up to 20 characters), with up to 10 rows in total across its sections. Row titles are up to 24 characters, descriptions up to 72.',
      properties: {
        buttonText: { type: 'string' },
        sections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              rows: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: OPTION_ID_PROPERTY,
                    title: { type: 'string' },
                    description: { type: 'string' },
                  },
                  required: ['title'],
                },
              },
            },
            required: ['rows'],
          },
        },
      },
      required: ['buttonText', 'sections'],
    },
  },
  required: ['to', 'body'],
  additionalProperties: false,
};

const handler = async (rawParams: unknown) => {
  const parsedParams = sendInteractiveMessageParamsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    throw new Error(z.prettifyError(parsedParams.error));
  }

  const params = parsedParams.data;
  const { whatsAppBusinessAccountId, accessToken, phoneNumberId } = await resolveWhatsAppSenderOrThrow(params);
  const conversation = await resolveWhatsAppConversationOrThrow({
    accessToken,
    whatsAppBusinessAccountId,
    phoneNumberId,
    recipientIdentity: getRecipientWhatsAppIdentity(params.to),
  });
  const latestIncomingMessage = await findLatestIncomingWhatsAppMessage({
    messageChannelId: conversation.messageChannel.id,
    threadExternalId: conversation.threadExternalId,
  });

  if (!isWithinWhatsAppCustomerServiceWindow({ lastCustomerMessageAt: latestIncomingMessage?.receivedAt })) {
    throw new Error(
      'WhatsApp only delivers interactive messages within 24 hours of the customer\'s last message. Send a template instead.',
    );
  }

  const response = await whatsAppApiRequest({
    accessToken,
    endpoint: 'POST /{phoneNumberId}/messages',
    pathParams: { phoneNumberId },
    data: {
      messaging_product: 'whatsapp',
      ...buildWhatsAppRecipient(params.to),
      type: 'interactive',
      interactive: buildWhatsAppInteractiveContent(params),
    },
  });
  const messageId = 'messages' in response ? response.messages[0]?.id : undefined;

  if (!isNonEmptyString(messageId)) {
    throw new Error('WhatsApp accepted the message without returning its ID');
  }

  // the message is already sent, so failing here would only tempt the caller to send it twice
  try {
    await ingestSentWhatsAppMessage({ conversation, messageId, text: formatWhatsAppInteractiveText(params) });
  } catch (error) {
    console.error(`WhatsApp interactive message ${messageId} was sent but could not be added to its conversation`, error);

    return { success: true, messageId, isAddedToConversation: false };
  }

  return { success: true, messageId, isAddedToConversation: true };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_SEND_INTERACTIVE_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'send-interactive-message',
  description:
    'Send a WhatsApp message with reply buttons or a list of options. Only works within 24 hours of the customer\'s last message; the customer\'s choice comes back as a reply in the conversation.',
  timeoutSeconds: 30,
  handler,
  toolTriggerSettings: { inputSchema: SEND_INTERACTIVE_MESSAGE_INPUT_SCHEMA },
});
