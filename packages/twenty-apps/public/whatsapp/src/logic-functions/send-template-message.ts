import { z } from 'zod';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { type InputJsonSchema } from 'twenty-sdk/logic-function';
import { WHATSAPP_LOGIC_FUNCTION_SEND_TEMPLATE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildTemplateComponents } from 'src/logic-functions/data/build-template-components.util';
import { getWhatsappAccessTokenOrThrow } from 'src/logic-functions/data/get-whatsapp-access-token-or-throw.util';
import { getDefaultWhatsappPhoneNumberIdOrThrow } from 'src/logic-functions/data/get-default-whatsapp-phone-number-id-or-throw.util';
import { sendTemplateMessageParamsSchema } from 'src/logic-functions/data/send-template-message-params.schema';
import { whatsappApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';

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
      description: 'Recipient phone number in international format.',
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
  },
  required: ['templateId', 'to'],
  additionalProperties: false,
};

const handler = async (rawParams: unknown) => {
  const parsedParams = sendTemplateMessageParamsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    return { success: false, error: z.prettifyError(parsedParams.error) };
  }

  const { templateId, phoneNumberId, to, parameters } = parsedParams.data;

  const { whatsAppTemplate } = await new CoreApiClient().query({
    whatsAppTemplate: {
      __args: { filter: { id: { eq: templateId } } },
      name: true,
      language: true,
      status: true,
      parameterFormat: true,
    },
  });

  if (!whatsAppTemplate) {
    return { success: false, error: 'Template not found' };
  }

  if (whatsAppTemplate.status !== 'APPROVED') {
    return {
      success: false,
      error: `Template is ${whatsAppTemplate.status ?? 'not synced'}, only APPROVED templates can be sent`,
    };
  }

  const accessToken = await getWhatsappAccessTokenOrThrow();

  const response = await whatsappApiRequest({
    accessToken,
    endpoint: 'POST /{phoneNumberId}/messages',
    pathParams: {
      phoneNumberId: phoneNumberId ?? (await getDefaultWhatsappPhoneNumberIdOrThrow({ accessToken })),
    },
    data: {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: whatsAppTemplate.name,
        language: { code: whatsAppTemplate.language },
        components: buildTemplateComponents(parameters, whatsAppTemplate.parameterFormat),
      },
    },
  });

  return {
    success: true,
    messageId: 'messages' in response ? response.messages[0]?.id : undefined,
  };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_SEND_TEMPLATE_UNIVERSAL_IDENTIFIER,
  name: 'send-template-message',
  description:
    'Send an approved WhatsApp template message. Templates are the only message type that can start a conversation outside the 24 hour customer service window.',
  timeoutSeconds: 30,
  handler,
  toolTriggerSettings: { inputSchema: SEND_TEMPLATE_MESSAGE_INPUT_SCHEMA },
});
