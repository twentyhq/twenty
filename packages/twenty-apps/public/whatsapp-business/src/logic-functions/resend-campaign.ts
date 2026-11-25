import { CoreApiClient } from 'twenty-client-sdk/core';
import { z } from 'zod';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';
import { WHATSAPP_CAMPAIGN_ROUTE_PATHS } from 'src/constants/whatsapp-campaign-route-paths.constant';
import { WHATSAPP_LOGIC_FUNCTION_RESEND_CAMPAIGN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { findWhatsAppCampaignRecipients } from 'src/logic-functions/data/find-whatsapp-campaign-recipients.util';
import { launchWhatsAppCampaign } from 'src/logic-functions/data/launch-whatsapp-campaign.util';
import { selectWhatsAppCampaignResendPersonIds } from 'src/logic-functions/data/select-whatsapp-campaign-resend-person-ids.util';
import { sendTemplateToPeopleParamsSchema } from 'src/logic-functions/data/send-template-to-people-params.schema';
import { splitSendTemplateToPeopleParams } from 'src/logic-functions/data/split-send-template-to-people-params.util';
import { type SendTemplateToPeopleResult } from 'src/logic-functions/types/send-template-to-people-result.type';

const resendCampaignParamsSchema = z.object({
  requestId: z.string().min(1).max(64),
  campaignId: z.string().min(1),
  audience: z.enum(['FAILED', 'NOT_REPLIED']),
  isDryRun: z.boolean().default(false),
});

// sends the campaign's template again, as a new campaign, to the people it did not reach or who did not reply
const handler = async (params: RoutePayload<unknown>): Promise<SendTemplateToPeopleResult> => {
  const parsedParams = resendCampaignParamsSchema.safeParse(params.body);

  if (!parsedParams.success) {
    return { success: false, error: z.prettifyError(parsedParams.error) };
  }

  const { requestId, campaignId, audience, isDryRun } = parsedParams.data;
  const userClient = new CoreApiClient({ runAs: 'user' });
  const { whatsAppCampaign } = await userClient.query({
    whatsAppCampaign: { __args: { filter: { id: { eq: campaignId } } }, createdAt: true, sendParameters: true },
  });

  if (!isDefined(whatsAppCampaign)) {
    return { success: false, error: 'WhatsApp campaign not found' };
  }

  const personIds = selectWhatsAppCampaignResendPersonIds({
    recipients: await findWhatsAppCampaignRecipients({
      client: userClient,
      campaignId,
      campaignCreatedAt: whatsAppCampaign.createdAt,
    }),
    audience,
  });

  if (personIds.length === 0) {
    return { success: false, error: 'Nobody in this campaign matches. There is no one to send it to again.' };
  }

  // the stored parameters are checked like a fresh send, so an outdated shape is refused rather than sent
  const parsedCampaign = sendTemplateToPeopleParamsSchema.safeParse({
    ...whatsAppCampaign.sendParameters,
    requestId,
    recipients: { personIds },
    isDryRun,
  });

  if (!parsedCampaign.success) {
    return { success: false, error: 'This campaign was sent before its parameters were stored and cannot be sent again.' };
  }

  const { recipients, content } = splitSendTemplateToPeopleParams(parsedCampaign.data);

  return launchWhatsAppCampaign({ requestId, recipients, isDryRun, content });
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_RESEND_CAMPAIGN_UNIVERSAL_IDENTIFIER,
  name: 'resend-campaign',
  description:
    'Sends a WhatsApp campaign again, as a new campaign, to the people whose message failed or who did not reply',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: { path: WHATSAPP_CAMPAIGN_ROUTE_PATHS.resend, httpMethod: 'POST', isAuthRequired: true },
});
