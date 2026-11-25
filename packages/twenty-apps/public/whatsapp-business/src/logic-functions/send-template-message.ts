import { z } from 'zod';
import { defineLogicFunction } from 'twenty-sdk/define';
import { type InputJsonSchema } from 'twenty-sdk/logic-function';
import { WHATSAPP_LOGIC_FUNCTION_SEND_TEMPLATE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { sendTemplateMessageParamsSchema } from 'src/logic-functions/data/send-template-message-params.schema';
import { sendWhatsAppTemplateMessageOrThrow } from 'src/logic-functions/data/send-whatsapp-template-message-or-throw.util';

const SEND_TEMPLATE_MESSAGE_INPUT_SCHEMA: InputJsonSchema = {
  type: 'object',
  properties: {
    templateId: {
      type: 'string',
      label: 'Template',
      description: 'ID of the WhatsApp template record in Twenty.',
    },
    phoneNumberId: {
      type: 'string',
      label: 'Phone number ID',
      description: 'Meta ID of the business phone number to send from. Optional when only one number is connected.',
    },
    to: {
      type: 'string',
      label: 'Recipient',
      description:
        'Recipient phone number in international format, or the WhatsApp user ID (for example US.13491208655302741918) of a user who hides their number.',
    },
    parameters: {
      type: 'array',
      label: 'Parameters',
      description:
        'Body parameter values in placeholder order. Include a name for each when the template uses named parameters.',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          value: { type: 'string' },
        },
        required: ['value'],
      },
    },
    headerParameters: {
      type: 'array',
      label: 'Header parameters',
      description: 'Values for a text header with parameters, same format as the body parameters.',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          value: { type: 'string' },
        },
        required: ['value'],
      },
    },
    headerMedia: {
      type: 'object',
      label: 'Header media',
      description:
        'Media for an image, video or document header, given as a public link or an uploaded media ID.',
      properties: {
        type: { type: 'string', enum: ['image', 'video', 'document'] },
        link: { type: 'string' },
        id: { type: 'string' },
        filename: { type: 'string' },
      },
      required: ['type'],
    },
    buttonParameters: {
      type: 'array',
      label: 'Button parameters',
      description:
        'One entry per button that takes a value: the quick reply payload, the dynamic URL suffix or the code to copy.',
      items: {
        type: 'object',
        properties: {
          index: { type: 'number' },
          subType: { type: 'string', enum: ['quick_reply', 'url', 'copy_code'] },
          value: { type: 'string' },
        },
        required: ['index', 'subType', 'value'],
      },
    },
  },
  required: ['templateId', 'to'],
  additionalProperties: false,
};

const handler = async (rawParams: unknown) => {
  const parsedParams = sendTemplateMessageParamsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    throw new Error(z.prettifyError(parsedParams.error));
  }

  return sendWhatsAppTemplateMessageOrThrow(parsedParams.data);
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_SEND_TEMPLATE_UNIVERSAL_IDENTIFIER,
  name: 'send-template-message',
  description:
    'Send an approved WhatsApp template message. Templates are the only message type that can start a conversation outside the 24 hour customer service window. Marketing templates are refused for people who stopped WhatsApp marketing messages.',
  timeoutSeconds: 30,
  handler,
  toolTriggerSettings: { inputSchema: SEND_TEMPLATE_MESSAGE_INPUT_SCHEMA },
});
