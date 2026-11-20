import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';
import { z } from 'zod';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { type InputJsonSchema } from 'twenty-sdk/logic-function';
import { WHATSAPP_LOGIC_FUNCTION_SEND_TEMPLATE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { isWhatsAppMarketingOptedOut } from 'src/logic-functions/data/is-whatsapp-marketing-opted-out.util';
import { getRecipientWhatsAppIdentity } from 'src/logic-functions/data/get-recipient-whatsapp-identity.util';
import { ingestSentWhatsAppMessage } from 'src/logic-functions/data/ingest-sent-whatsapp-message.util';
import { resolveWhatsAppConversationOrThrow } from 'src/logic-functions/data/resolve-whatsapp-conversation-or-throw.util';
import { renderWhatsAppTemplateText } from 'src/logic-functions/data/render-whatsapp-template-text.util';
import { buildWhatsAppRecipient } from 'src/logic-functions/data/build-whatsapp-recipient.util';
import { buildTemplateComponents } from 'src/logic-functions/data/build-template-components.util';
import { getWhatsAppAccessTokenOrThrow } from 'src/logic-functions/data/get-whatsapp-access-token-or-throw.util';
import { getDefaultWhatsAppPhoneNumberIdOrThrow } from 'src/logic-functions/data/get-default-whatsapp-phone-number-id-or-throw.util';
import { sendTemplateMessageParamsSchema } from 'src/logic-functions/data/send-template-message-params.schema';
import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';

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

  const { templateId, phoneNumberId, to, parameters, headerParameters, headerMedia, buttonParameters, campaignId } =
    parsedParams.data;

  const { whatsAppTemplate } = await new CoreApiClient().query({
    whatsAppTemplate: {
      __args: { filter: { id: { eq: templateId } } },
      name: true,
      language: true,
      status: true,
      category: true,
      parameterFormat: true,
      components: true,
      whatsAppBusinessAccountId: true,
    },
  });

  if (!isDefined(whatsAppTemplate)) {
    throw new Error(`WhatsApp template ${templateId} not found`);
  }

  if (whatsAppTemplate.status !== 'APPROVED') {
    throw new Error(
      `Template is ${whatsAppTemplate.status ?? 'not synced'}, only APPROVED templates can be sent`,
    );
  }

  if (
    whatsAppTemplate.category === 'MARKETING' &&
    (await isWhatsAppMarketingOptedOut(getRecipientWhatsAppIdentity(to)))
  ) {
    throw new Error('The recipient stopped WhatsApp marketing messages from this business');
  }

  const { whatsAppBusinessAccountId } = whatsAppTemplate;

  if (!isNonEmptyString(whatsAppBusinessAccountId)) {
    throw new Error('Template is not linked to a WhatsApp Business Account, reconnect WhatsApp to resync it');
  }

  const accessToken = await getWhatsAppAccessTokenOrThrow({ whatsAppBusinessAccountId });
  const senderPhoneNumberId =
    phoneNumberId ?? (await getDefaultWhatsAppPhoneNumberIdOrThrow({ accessToken, whatsAppBusinessAccountId }));

  const response = await whatsAppApiRequest({
    accessToken,
    endpoint: 'POST /{phoneNumberId}/messages',
    pathParams: { phoneNumberId: senderPhoneNumberId },
    data: {
      messaging_product: 'whatsapp',
      ...buildWhatsAppRecipient(to),
      type: 'template',
      template: {
        name: whatsAppTemplate.name,
        language: { code: whatsAppTemplate.language },
        components: buildTemplateComponents({
          bodyParameters: parameters,
          headerParameters,
          headerMedia,
          buttonParameters,
          parameterFormat: whatsAppTemplate.parameterFormat,
        }),
      },
    },
  });

  const messageId = 'messages' in response ? response.messages[0]?.id : undefined;

  if (!isNonEmptyString(messageId)) {
    return { success: true, messageId };
  }

  const recipientContact = 'contacts' in response ? response.contacts[0] : undefined;
  const recipientIdentityFromInput = getRecipientWhatsAppIdentity(to);

  const renderedText = renderWhatsAppTemplateText({
    components: Array.isArray(whatsAppTemplate.components) ? whatsAppTemplate.components : [],
    headerParameters,
    bodyParameters: parameters,
    parameterFormat: whatsAppTemplate.parameterFormat,
  });

  // the template is already sent, so failing here would only tempt the caller to send it twice
  try {
    await ingestSentWhatsAppMessage({
      conversation: await resolveWhatsAppConversationOrThrow({
        accessToken,
        whatsAppBusinessAccountId,
        phoneNumberId: senderPhoneNumberId,
        recipientIdentity: {
          whatsAppId: recipientContact?.wa_id ?? recipientIdentityFromInput.whatsAppId,
          whatsAppUserId: recipientContact?.user_id ?? recipientIdentityFromInput.whatsAppUserId,
        },
      }),
      messageId,
      text: isNonEmptyString(renderedText) ? renderedText : whatsAppTemplate.name,
      campaignId,
    });
  } catch (error) {
    console.error(`WhatsApp template message ${messageId} was sent but could not be added to its conversation`, error);

    return { success: true, messageId, isAddedToConversation: false };
  }

  return { success: true, messageId, isAddedToConversation: true };
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
