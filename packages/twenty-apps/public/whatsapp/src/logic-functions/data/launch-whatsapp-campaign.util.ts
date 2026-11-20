import { CoreApiClient } from 'twenty-client-sdk/core';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { WHATSAPP_LOGIC_FUNCTION_SEND_CAMPAIGN_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { WHATSAPP_CAMPAIGN_MAX_SCHEDULE_DELAY_MS } from 'src/constants/whatsapp-campaign-max-schedule-delay-ms.constant';
import { WHATSAPP_KV_KEY_PREFIXES } from 'src/constants/whatsapp-kv-key-prefixes.constant';
import { createWhatsAppCampaignSkips } from 'src/logic-functions/data/create-whatsapp-campaign-skips.util';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { findWhatsAppTemplateRecipientPeopleOrThrow } from 'src/logic-functions/data/find-whatsapp-template-recipient-people-or-throw.util';
import { resolveWhatsAppCampaignRecipient } from 'src/logic-functions/data/resolve-whatsapp-campaign-recipient.util';
import { type SendCampaignMessagePayload } from 'src/logic-functions/types/send-campaign-message-payload.type';
import { type SendTemplateToPeopleResult } from 'src/logic-functions/types/send-template-to-people-result.type';
import { type WhatsAppCampaignContent } from 'src/logic-functions/types/whatsapp-campaign-content.type';
import { type WhatsAppCampaignSkipReason } from 'src/logic-functions/types/whatsapp-campaign-skip-reason.type';
import { type WhatsAppTemplateRecipientPerson } from 'src/logic-functions/types/whatsapp-template-recipient-person.type';

// counts the recipients, then creates the campaign and queues one job per person; each job resolves
// the person again when it runs, so a scheduled campaign uses their values at send time
export const launchWhatsAppCampaign = async ({
  requestId,
  recipients,
  isDryRun,
  sendAt,
  content,
}: {
  requestId: string;
  recipients: { personIds: string[] } | { filter: Record<string, unknown> };
  isDryRun: boolean;
  sendAt?: string;
  content: WhatsAppCampaignContent;
}): Promise<SendTemplateToPeopleResult> => {
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
      __args: { filter: { id: { eq: content.templateId } } },
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

  const skippedCountByReason: Record<WhatsAppCampaignSkipReason, number> = {
    NO_WHATSAPP_NUMBER: 0,
    MARKETING_OPT_OUT: 0,
    MISSING_PERSONALIZED_VALUE: 0,
  };
  const recipientPersonIds: string[] = [];
  const skips: { person: WhatsAppTemplateRecipientPerson; reason: WhatsAppCampaignSkipReason }[] = [];

  for (const person of people) {
    const recipient = resolveWhatsAppCampaignRecipient({ person, templateCategory: whatsAppTemplate.category, content });

    if ('skipReason' in recipient) {
      skippedCountByReason[recipient.skipReason] += 1;
      skips.push({ person, reason: recipient.skipReason });
    } else {
      recipientPersonIds.push(person.id);
    }
  }

  const skippedCount = Object.values(skippedCountByReason).reduce((total, count) => total + count, 0);

  if (isDryRun || recipientPersonIds.length === 0) {
    return {
      success: true,
      queuedCount: isDryRun ? recipientPersonIds.length : 0,
      skippedCount,
      skippedCountByReason,
    };
  }

  const { createWhatsAppCampaign } = await new CoreApiClient().mutation({
    createWhatsAppCampaign: {
      __args: {
        data: {
          name: `${whatsAppTemplate.name} · ${new Date(sendAt ?? Date.now()).toISOString().slice(0, 16).replace('T', ' ')} UTC`,
          templateId: content.templateId,
          queuedCount: recipientPersonIds.length,
          skippedCount,
          sendParameters: content,
          ...(isDefined(sendAt) ? { scheduledAt: sendAt } : {}),
        },
      },
      id: true,
    },
  });

  await createWhatsAppCampaignSkips({ campaignId: createWhatsAppCampaign.id, skips });

  await enqueueLogicFunctionJobs<SendCampaignMessagePayload>({
    logicFunctionUniversalIdentifier: WHATSAPP_LOGIC_FUNCTION_SEND_CAMPAIGN_MESSAGE_UNIVERSAL_IDENTIFIER,
    payloads: recipientPersonIds.map((personId) => ({ ...content, campaignId: createWhatsAppCampaign.id, personId })),
    getJobKey: ({ personId }) => `${requestId}:${personId}`,
    ...(delayMs > 0 ? { delayMs } : {}),
  });

  const result: SendTemplateToPeopleResult = {
    success: true,
    queuedCount: recipientPersonIds.length,
    skippedCount,
    skippedCountByReason,
    campaignId: createWhatsAppCampaign.id,
  };

  await kv.set(requestKey, result);

  return result;
};
