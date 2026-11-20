import { CoreApiClient } from 'twenty-client-sdk/core';
import { z } from 'zod';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { SEND_TEMPLATE_TO_PEOPLE_ROUTE_PATH } from 'src/constants/send-template-to-people-route-path.constant';
import {
  WHATSAPP_LOGIC_FUNCTION_SEND_TEMPLATE_TO_PEOPLE_UNIVERSAL_IDENTIFIER,
  WHATSAPP_LOGIC_FUNCTION_SEND_TEMPLATE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { WHATSAPP_CAMPAIGN_MAX_SCHEDULE_DELAY_MS } from 'src/constants/whatsapp-campaign-max-schedule-delay-ms.constant';
import { WHATSAPP_KV_KEY_PREFIXES } from 'src/constants/whatsapp-kv-key-prefixes.constant';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { findWhatsAppTemplateRecipientPeopleOrThrow } from 'src/logic-functions/data/find-whatsapp-template-recipient-people-or-throw.util';
import { getPersonWhatsAppRecipient } from 'src/logic-functions/data/get-person-whatsapp-recipient.util';
import { resolvePersonTemplateParameters } from 'src/logic-functions/data/resolve-person-template-parameters.util';
import { sendTemplateToPeopleParamsSchema } from 'src/logic-functions/data/send-template-to-people-params.schema';
import { type SendTemplateToPeopleResult } from 'src/logic-functions/types/send-template-to-people-result.type';
import { type TemplateParameterInput } from 'src/logic-functions/types/send-template-message-params.type';
import { type WhatsAppTemplateRecipientPerson } from 'src/logic-functions/types/whatsapp-template-recipient-person.type';

type SkippedCountByReason = Extract<SendTemplateToPeopleResult, { success: true }>['skippedCountByReason'];

const handler = async (params: RoutePayload<unknown>): Promise<SendTemplateToPeopleResult> => {
  const parsedParams = sendTemplateToPeopleParamsSchema.safeParse(params.body);

  if (!parsedParams.success) {
    return { success: false, error: z.prettifyError(parsedParams.error) };
  }

  const { requestId, recipients, isDryRun, sendAt, parameters, headerParameters, ...templateContent } =
    parsedParams.data;
  const requestKey = `${WHATSAPP_KV_KEY_PREFIXES.campaignRequest}${requestId}`;

  // a retried request returns the campaign it already created instead of creating another one
  if (!isDryRun) {
    const previousResult = await kv.get<SendTemplateToPeopleResult>(requestKey);

    if (previousResult !== null) {
      return previousResult;
    }
  }

  const delayMs = isDefined(sendAt) ? new Date(sendAt).getTime() - Date.now() : 0;

  if (delayMs > WHATSAPP_CAMPAIGN_MAX_SCHEDULE_DELAY_MS) {
    return { success: false, error: 'A campaign can be scheduled at most 30 days ahead' };
  }

  // the selection and the template are read as the member, so nobody reaches people their role hides
  const userClient = new CoreApiClient({ runAs: 'user' });

  const { whatsAppTemplate } = await userClient.query({
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

  let people: WhatsAppTemplateRecipientPerson[];

  try {
    people = await findWhatsAppTemplateRecipientPeopleOrThrow({ client: userClient, recipients });
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }

  const skippedCountByReason: SkippedCountByReason = {
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

  const { createWhatsAppCampaign } = await new CoreApiClient().mutation({
    createWhatsAppCampaign: {
      __args: {
        data: {
          name: `${whatsAppTemplate.name} · ${new Date(sendAt ?? Date.now()).toISOString().slice(0, 16).replace('T', ' ')} UTC`,
          templateId: templateContent.templateId,
          queuedCount: sends.length,
          skippedCount,
          ...(isDefined(sendAt) ? { scheduledAt: sendAt } : {}),
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
    ...(delayMs > 0 ? { delayMs } : {}),
  });

  const result: SendTemplateToPeopleResult = {
    success: true,
    queuedCount: sends.length,
    skippedCount,
    skippedCountByReason,
    campaignId: createWhatsAppCampaign.id,
  };

  await kv.set(requestKey, result);

  return result;
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
