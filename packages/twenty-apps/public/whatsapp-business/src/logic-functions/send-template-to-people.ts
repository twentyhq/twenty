import { z } from 'zod';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { SEND_TEMPLATE_TO_PEOPLE_ROUTE_PATH } from 'src/constants/send-template-to-people-route-path.constant';
import { WHATSAPP_LOGIC_FUNCTION_SEND_TEMPLATE_TO_PEOPLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { launchWhatsAppCampaign } from 'src/logic-functions/data/launch-whatsapp-campaign.util';
import { sendTemplateToPeopleParamsSchema } from 'src/logic-functions/data/send-template-to-people-params.schema';
import { splitSendTemplateToPeopleParams } from 'src/logic-functions/data/split-send-template-to-people-params.util';
import { type SendTemplateToPeopleResult } from 'src/logic-functions/types/send-template-to-people-result.type';

const handler = async (params: RoutePayload<unknown>): Promise<SendTemplateToPeopleResult> => {
  const parsedParams = sendTemplateToPeopleParamsSchema.safeParse(params.body);

  if (!parsedParams.success) {
    return { success: false, error: z.prettifyError(parsedParams.error) };
  }

  return launchWhatsAppCampaign(splitSendTemplateToPeopleParams(parsedParams.data));
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_SEND_TEMPLATE_TO_PEOPLE_UNIVERSAL_IDENTIFIER,
  name: 'send-template-to-people',
  description:
    'Sends an approved WhatsApp template to the selected people as a campaign, now or at a scheduled time, with personalized values; a dry run only counts the recipients',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: {
    path: SEND_TEMPLATE_TO_PEOPLE_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
