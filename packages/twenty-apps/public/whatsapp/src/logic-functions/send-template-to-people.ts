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
import { getPersonWhatsAppRecipient } from 'src/logic-functions/data/get-person-whatsapp-recipient.util';
import { sendTemplateToPeopleParamsSchema } from 'src/logic-functions/data/send-template-to-people-params.schema';
import { type WhatsAppTemplateRecipientPerson } from 'src/logic-functions/types/whatsapp-template-recipient-person.type';

type SkippedPerson = { personId: string; reason: 'NO_WHATSAPP_NUMBER' | 'MARKETING_OPT_OUT' };

const handler = async (params: RoutePayload<unknown>) => {
  const parsedParams = sendTemplateToPeopleParamsSchema.safeParse(params.body);

  if (!parsedParams.success) {
    return { success: false, error: z.prettifyError(parsedParams.error) };
  }

  const { requestId, personIds, ...templateContent } = parsedParams.data;
  const client = new CoreApiClient();

  const { whatsAppTemplate } = await client.query({
    whatsAppTemplate: {
      __args: { filter: { id: { eq: templateContent.templateId } } },
      status: true,
      category: true,
    },
  });

  if (!isDefined(whatsAppTemplate) || whatsAppTemplate.status !== 'APPROVED') {
    return { success: false, error: 'Only APPROVED WhatsApp templates can be sent' };
  }

  const { people } = await client.query({
    people: {
      __args: { filter: { id: { in: personIds } }, first: personIds.length },
      edges: {
        node: {
          id: true,
          whatsAppId: true,
          whatsAppUserId: true,
          whatsAppMarketingOptOut: true,
          phones: { primaryPhoneNumber: true, primaryPhoneCallingCode: true },
        },
      },
    },
  });

  const skipped: SkippedPerson[] = [];
  const payloads: Array<typeof templateContent & { to: string }> = [];

  for (const edge of people?.edges ?? []) {
    const person: WhatsAppTemplateRecipientPerson = edge.node;
    const to = getPersonWhatsAppRecipient(person);

    if (!isDefined(to)) {
      skipped.push({ personId: person.id, reason: 'NO_WHATSAPP_NUMBER' });
    } else if (whatsAppTemplate.category === 'MARKETING' && person.whatsAppMarketingOptOut === true) {
      skipped.push({ personId: person.id, reason: 'MARKETING_OPT_OUT' });
    } else {
      payloads.push({ ...templateContent, to });
    }
  }

  // send-template-message runs once per recipient, so Meta's rate limits apply to jobs rather than this request
  await enqueueLogicFunctionJobs({
    logicFunctionUniversalIdentifier: WHATSAPP_LOGIC_FUNCTION_SEND_TEMPLATE_UNIVERSAL_IDENTIFIER,
    payloads,
    getJobKey: ({ to }) => `${requestId}:${to}`,
  });

  return { success: true, queuedCount: payloads.length, skipped };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_SEND_TEMPLATE_TO_PEOPLE_UNIVERSAL_IDENTIFIER,
  name: 'send-template-to-people',
  description:
    'Queues an approved WhatsApp template for each selected person, skipping people without a number and, for marketing templates, people who opted out',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: SEND_TEMPLATE_TO_PEOPLE_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
