import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';
import { WHATSAPP_CAMPAIGN_RECIPIENTS_ROUTE_PATH } from 'src/constants/whatsapp-campaign-recipients-route-path.constant';
import { WHATSAPP_LOGIC_FUNCTION_GET_CAMPAIGN_RECIPIENTS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { findWhatsAppCampaignRecipients } from 'src/logic-functions/data/find-whatsapp-campaign-recipients.util';
import { type WhatsAppCampaignRecipient } from 'src/logic-functions/types/whatsapp-campaign-recipient.type';

const handler = async (
  params: RoutePayload<unknown>,
): Promise<{ success: true; recipients: WhatsAppCampaignRecipient[] } | { success: false; error: string }> => {
  const campaignId = params.queryStringParameters?.campaignId;

  if (!isNonEmptyString(campaignId)) {
    return { success: false, error: 'campaignId is required' };
  }

  // read as the member, so the list only shows messages their role can see
  const client = new CoreApiClient({ runAs: 'user' });
  const { whatsAppCampaign } = await client.query({
    whatsAppCampaign: { __args: { filter: { id: { eq: campaignId } } }, createdAt: true },
  });

  if (!isDefined(whatsAppCampaign)) {
    return { success: false, error: 'WhatsApp campaign not found' };
  }

  return {
    success: true,
    recipients: await findWhatsAppCampaignRecipients({
      client,
      campaignId,
      campaignCreatedAt: whatsAppCampaign.createdAt,
    }),
  };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_GET_CAMPAIGN_RECIPIENTS_UNIVERSAL_IDENTIFIER,
  name: 'get-campaign-recipients',
  description: 'Lists the recipients of a WhatsApp campaign with the delivery status and whether they replied',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: { path: WHATSAPP_CAMPAIGN_RECIPIENTS_ROUTE_PATH, httpMethod: 'GET', isAuthRequired: true },
});
