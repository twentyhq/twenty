import { CoreApiClient } from 'twenty-client-sdk/core';
import { z } from 'zod';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';
import { WHATSAPP_CAMPAIGN_ROUTE_PATHS } from 'src/constants/whatsapp-campaign-route-paths.constant';
import { WHATSAPP_LOGIC_FUNCTION_CANCEL_CAMPAIGN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type TemplateRouteResult } from 'src/logic-functions/types/template-route-result.type';

const cancelCampaignParamsSchema = z.object({ campaignId: z.string().min(1) });

// queued jobs cannot be withdrawn, so each one checks the cancellation before sending
const handler = async (params: RoutePayload<unknown>): Promise<TemplateRouteResult> => {
  const parsedParams = cancelCampaignParamsSchema.safeParse(params.body);

  if (!parsedParams.success) {
    return { success: false, error: z.prettifyError(parsedParams.error) };
  }

  const { campaignId } = parsedParams.data;
  const { whatsAppCampaign } = await new CoreApiClient({ runAs: 'user' }).query({
    whatsAppCampaign: { __args: { filter: { id: { eq: campaignId } } }, id: true, cancelledAt: true },
  });

  if (!isDefined(whatsAppCampaign)) {
    return { success: false, error: 'WhatsApp campaign not found' };
  }

  if (!isDefined(whatsAppCampaign.cancelledAt)) {
    await new CoreApiClient().mutation({
      updateWhatsAppCampaign: {
        __args: { id: campaignId, data: { cancelledAt: new Date().toISOString() } },
        id: true,
      },
    });
  }

  return { success: true };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_CANCEL_CAMPAIGN_UNIVERSAL_IDENTIFIER,
  name: 'cancel-campaign',
  description: 'Cancels a WhatsApp campaign: messages not sent yet are skipped',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: { path: WHATSAPP_CAMPAIGN_ROUTE_PATHS.cancel, httpMethod: 'POST', isAuthRequired: true },
});
