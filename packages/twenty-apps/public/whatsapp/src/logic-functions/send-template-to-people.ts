import { CoreApiClient } from 'twenty-client-sdk/core';
import { z } from 'zod';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';
import { SEND_TEMPLATE_TO_PEOPLE_ROUTE_PATH } from 'src/constants/send-template-to-people-route-path.constant';
import {
  WHATSAPP_LOGIC_FUNCTION_SEND_TEMPLATE_TO_PEOPLE_UNIVERSAL_IDENTIFIER,
  WHATSAPP_LOGIC_FUNCTION_SEND_TEMPLATE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { findWhatsAppTemplateRecipientPeopleOrThrow } from 'src/logic-functions/data/find-whatsapp-template-recipient-people-or-throw.util';
import { getPersonWhatsAppRecipient } from 'src/logic-functions/data/get-person-whatsapp-recipient.util';
import { resolvePersonTemplateParameters } from 'src/logic-functions/data/resolve-person-template-parameters.util';
import { sendTemplateToPeopleParamsSchema } from 'src/logic-functions/data/send-template-to-people-params.schema';
import { type TemplateParameterInput } from 'src/logic-functions/types/send-template-message-params.type';

type SkipReason = 'NO_WHATSAPP_NUMBER' | 'MARKETING_OPT_OUT' | 'MISSING_PERSONALIZED_VALUE';

const handler = async (params: RoutePayload<unknown>) => {
  const parsedParams = sendTemplateToPeopleParamsSchema.safeParse(params.body);

  if (!parsedParams.success) {
    return { success: false, error: z.prettifyError(parsedParams.error) };
  }

  const { requestId, recipients, isDryRun, parameters, headerParameters, ...templateContent } = parsedParams.data;
  const client = new CoreApiClient();

  const { whatsAppTemplate } = await client.query({
    whatsAppTemplate: {
      __args: { filter: { id: { eq: templateContent.templateId } } },
      name: true,
      status: true,
      category: true,
    },
  });

  if (!isDefined(whatsAppTemplate) || whatsAppTemplate.status !== 'APPROVED') {
    return { success: false, error: 'Only APPROVED WhatsApp templates can be sent' };
  }

  let people;

  try {
    people = await findWhatsAppTemplateRecipientPeopleOrThrow(recipients);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }

  const skippedCountByReason: Record<SkipReason, number> = {
    NO_WHATSAPP_NUMBER: 0,
    MARKETING_OPT_OUT: 0,
    MISSING_PERSONALIZED_VALUE: 0,
  };
  const sends: Array<{ to: string; parameters: TemplateParameterInput[]; headerParameters: TemplateParameterInput[] }> = [];

  for (const person of people) {
    const to = getPersonWhatsAppRecipient(person);
    const personParameters = resolvePersonTemplateParameters({ parameters, person });
    const personHeaderParameters = resolvePersonTemplateParameters({ parameters: headerParameters, person });

    if (!isDefined(to)) {
      skippedCountByReason.NO_WHATSAPP_NUMBER += 1;
    } else if (whatsAppTemplate.category === 'MARKETING' && person.whatsAppMarketingOptOut === true) {
      skippedCountByReason.MARKETING_OPT_OUT += 1;
    } else if (!isDefined(personParameters) || !isDefined(personHeaderParameters)) {
      skippedCountByReason.MISSING_PERSONALIZED_VALUE += 1;
    } else {
      sends.push({ to, parameters: personParameters, headerParameters: personHeaderParameters });
    }
  }

  const skippedCount = Object.values(skippedCountByReason).reduce((total, count) => total + count, 0);

  if (isDryRun || sends.length === 0) {
    return { success: true, queuedCount: isDryRun ? sends.length : 0, skippedCount, skippedCountByReason };
  }

  const { createWhatsAppCampaign } = await client.mutation({
    createWhatsAppCampaign: {
      __args: {
        data: {
          name: `${whatsAppTemplate.name} · ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`,
          templateId: templateContent.templateId,
          queuedCount: sends.length,
          skippedCount,
        },
      },
      id: true,
    },
  });

  // send-template-message runs once per recipient, so Meta's rate limits apply to jobs rather than this request
  await enqueueLogicFunctionJobs({
    logicFunctionUniversalIdentifier: WHATSAPP_LOGIC_FUNCTION_SEND_TEMPLATE_UNIVERSAL_IDENTIFIER,
    payloads: sends.map((send) => ({ ...templateContent, ...send, campaignId: createWhatsAppCampaign.id })),
    getJobKey: ({ to }) => `${requestId}:${to}`,
  });

  return {
    success: true,
    queuedCount: sends.length,
    skippedCount,
    skippedCountByReason,
    campaignId: createWhatsAppCampaign.id,
  };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_SEND_TEMPLATE_TO_PEOPLE_UNIVERSAL_IDENTIFIER,
  name: 'send-template-to-people',
  description:
    'Sends an approved WhatsApp template to the selected people as a campaign, one queued message per person, with personalized values; a dry run only counts the recipients',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: {
    path: SEND_TEMPLATE_TO_PEOPLE_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
