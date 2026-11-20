import { isNonEmptyString } from '@sniptt/guards';
import { type z } from 'zod';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';
import { buildTemplateComponents } from 'src/logic-functions/data/build-template-components.util';
import { buildWhatsAppRecipient } from 'src/logic-functions/data/build-whatsapp-recipient.util';
import { getDefaultWhatsAppPhoneNumberIdOrThrow } from 'src/logic-functions/data/get-default-whatsapp-phone-number-id-or-throw.util';
import { getRecipientWhatsAppIdentity } from 'src/logic-functions/data/get-recipient-whatsapp-identity.util';
import { getWhatsAppAccessTokenOrThrow } from 'src/logic-functions/data/get-whatsapp-access-token-or-throw.util';
import { ingestSentWhatsAppMessage } from 'src/logic-functions/data/ingest-sent-whatsapp-message.util';
import { isWhatsAppMarketingOptedOut } from 'src/logic-functions/data/is-whatsapp-marketing-opted-out.util';
import { renderWhatsAppTemplateText } from 'src/logic-functions/data/render-whatsapp-template-text.util';
import { resolveWhatsAppConversationOrThrow } from 'src/logic-functions/data/resolve-whatsapp-conversation-or-throw.util';
import { type sendTemplateMessageParamsSchema } from 'src/logic-functions/data/send-template-message-params.schema';
import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';

export const sendWhatsAppTemplateMessageOrThrow = async ({
  templateId,
  phoneNumberId,
  to,
  parameters,
  headerParameters,
  headerMedia,
  buttonParameters,
  campaignId,
}: z.infer<typeof sendTemplateMessageParamsSchema>) => {
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
