import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';
import { WHATSAPP_LOGIC_FUNCTION_SEND_CAMPAIGN_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { findWhatsAppTemplateRecipientPeopleOrThrow } from 'src/logic-functions/data/find-whatsapp-template-recipient-people-or-throw.util';
import { resolveWhatsAppCampaignRecipient } from 'src/logic-functions/data/resolve-whatsapp-campaign-recipient.util';
import { sendWhatsAppTemplateMessageOrThrow } from 'src/logic-functions/data/send-whatsapp-template-message-or-throw.util';
import { type SendCampaignMessagePayload } from 'src/logic-functions/types/send-campaign-message-payload.type';

const handler = async ({ campaignId, personId, ...content }: SendCampaignMessagePayload) => {
  const client = new CoreApiClient();
  const { whatsAppCampaign } = await client.query({
    whatsAppCampaign: { __args: { filter: { id: { eq: campaignId } } }, cancelledAt: true },
  });

  if (!isDefined(whatsAppCampaign) || isDefined(whatsAppCampaign.cancelledAt)) {
    return { isSent: false, reason: 'CAMPAIGN_CANCELLED' };
  }

  const { whatsAppTemplate } = await client.query({
    whatsAppTemplate: { __args: { filter: { id: { eq: content.templateId } } }, category: true },
  });
  const [person] = await findWhatsAppTemplateRecipientPeopleOrThrow({ client, recipients: { personIds: [personId] } });

  if (!isDefined(person)) {
    return { isSent: false, reason: 'PERSON_DELETED' };
  }

  // the person may have changed since the campaign was scheduled
  const recipient = resolveWhatsAppCampaignRecipient({
    person,
    templateCategory: whatsAppTemplate?.category ?? null,
    content,
  });

  if ('skipReason' in recipient) {
    return { isSent: false, reason: recipient.skipReason };
  }

  const result = await sendWhatsAppTemplateMessageOrThrow({
    templateId: content.templateId,
    phoneNumberId: content.phoneNumberId,
    headerMedia: content.headerMedia,
    buttonParameters: content.buttonParameters,
    to: recipient.to,
    parameters: recipient.parameters,
    headerParameters: recipient.headerParameters,
    campaignId,
  });

  return { isSent: true, messageId: result.messageId };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_SEND_CAMPAIGN_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'send-campaign-message',
  description:
    'Sends a WhatsApp campaign template to one person, with their values at send time, unless the campaign was cancelled',
  timeoutSeconds: 60,
  handler,
});
