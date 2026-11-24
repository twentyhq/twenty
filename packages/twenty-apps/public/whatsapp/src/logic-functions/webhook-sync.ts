import { defineLogicFunction, RoutePayload } from 'twenty-sdk/define';
import { WhatsAppWebhook } from 'src/logic-functions/types/whatsapp-webhook-message.type';
import { validateWebhookPayload } from 'src/logic-functions/data/validate-webhook-payload.util';
import { Response } from "twenty-sdk/logic-function";
import {
  WHATSAPP_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER,
  WHATSAPP_LOGIC_FUNCTION_UPDATE_MESSAGE_STATUS_UNIVERSAL_IDENTIFIER,
  WHATSAPP_LOGIC_FUNCTION_WEBHOOK_SYNC_UNIVERSAL_IDENTIFIER,
} from "src/constants/universal-identifiers";
import { type ParseMessagePayload } from "src/logic-functions/types/parse-message-payload.type";
import { type UpdateMessageStatusPayload } from "src/logic-functions/types/update-message-status-payload.type";
import { enqueueLogicFunctionJobs } from "src/logic-functions/data/enqueue-logic-function-jobs.util";
import { upsertWhatsAppTemplates } from "src/logic-functions/data/upsert-whatsapp-templates.util";
import { syncWhatsAppTemplate } from "src/logic-functions/data/sync-whatsapp-template.util";
import { getWhatsAppAccessTokenOrThrow } from "src/logic-functions/data/get-whatsapp-access-token-or-throw.util";
import { findConnectedAccountIdByWhatsAppBusinessAccountId } from "src/logic-functions/data/find-connected-account-id-by-whatsapp-business-account-id.util";
import { isDefined } from "twenty-sdk/utils";
import { buildHistoryParseMessagePayloads } from "src/logic-functions/data/build-history-parse-message-payloads.util";
import { isNonEmptyString } from "@sniptt/guards";
import { sendInboxNotification } from "src/logic-functions/data/send-inbox-notification.util";
import { updateWhatsAppMarketingPreference } from "src/logic-functions/data/update-whatsapp-marketing-preference.util";
import { parseWhatsAppTimestamp } from "src/logic-functions/data/parse-whatsapp-timestamp.util";
import { isSameWhatsAppIdentity } from "src/logic-functions/data/is-same-whatsapp-identity.util";

const enqueueParseMessageJobs = (payloads: ParseMessagePayload[]) =>
  enqueueLogicFunctionJobs({
    logicFunctionUniversalIdentifier: WHATSAPP_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER,
    payloads,
    getJobKey: ({ messages }) => messages.id,
  });

const handler = async (
  params: RoutePayload<WhatsAppWebhook>,
): Promise<object> => {
  if (!process.env.WEBHOOK_VALIDATION_SECRET) {
    console.error('WEBHOOK_VALIDATION_SECRET is not configured');
    return new Response('', { status: 500 });
  }

  const { rawBody, body, headers } = params;
  const signature = headers['x-hub-signature-256'];
  if (
    rawBody === undefined ||
    !isNonEmptyString(signature) ||
    !validateWebhookPayload({
      signature,
      payload: rawBody,
      appSecret: process.env.WEBHOOK_VALIDATION_SECRET,
    })
  ) {
    return new Response('', { status: 401 });
  }

  if (body === null || body?.entry === undefined || body.object !== 'whatsapp_business_account') {
    return new Response('', { status: 400 });
  }

  for (const entry of body.entry) {
    if (!isDefined(await findConnectedAccountIdByWhatsAppBusinessAccountId(entry.id))) {
      console.warn(`Ignoring webhook for WhatsApp Business Account ${entry.id}, it is not connected`);
      continue;
    }

    const syncTemplate = async (metaTemplateId: number) =>
      syncWhatsAppTemplate({
        accessToken: await getWhatsAppAccessTokenOrThrow({ whatsAppBusinessAccountId: entry.id }),
        metaTemplateId: String(metaTemplateId),
        whatsAppBusinessAccountId: entry.id,
      });

    for (const change of entry.changes) {
      const notify = (title: string, text: string) =>
        sendInboxNotification({
          threadKey: `${change.field}:${entry.id}`,
          idempotencyKey: JSON.stringify(change.value),
          title,
          text,
        });

      switch (change.field) {
        case "account_alerts":
          await notify(
            "WhatsApp account alerts",
            `${change.value.alert_info.alert_severity}: ${change.value.alert_info.alert_description}`,
          );
          break;
        case "account_review_update":
          await notify(
            "WhatsApp account review",
            `Account review decision: ${change.value.decision}`,
          );
          break;
        case "account_update":
          await notify(
            "WhatsApp account updates",
            `Account update: ${change.value.event}`,
          );
          break;
        case "automatic_events":
        case "business_capability_update":
          break;
        case "history": {
          for (const chunk of change.value.history) {
            if ('errors' in chunk) {
              console.error('WhatsApp history sync failed', chunk.errors);
            }
          }
          await enqueueParseMessageJobs(
            buildHistoryParseMessagePayloads({
              whatsAppBusinessAccountId: entry.id,
              businessData: change.value.metadata,
              chunks: change.value.history,
            }),
          );
          break;
        }
        case "message_template_components_update":
        case "message_template_quality_update":
          await syncTemplate(change.value.message_template_id);
          break;
        case "message_template_status_update":
          // a deleted template can no longer be fetched from Meta
          if (change.value.event === 'DELETED') {
            await upsertWhatsAppTemplates([
              {
                metaTemplateId: String(change.value.message_template_id),
                whatsAppBusinessAccountId: entry.id,
                name: change.value.message_template_name,
                language: change.value.message_template_language,
                status: change.value.event,
              },
            ]);
            break;
          }
          await syncTemplate(change.value.message_template_id);
          break;
        case "partner_solutions":
        case "payment_configuration_update":
        case "phone_number_name_update":
          break;
        case "phone_number_quality_update":
          await notify(
            "WhatsApp phone number quality",
            `${change.value.display_phone_number}: ${change.value.event}, daily conversation limit ${change.value.max_daily_conversations_per_business}`,
          );
          break;
        case "security":
          await notify(
            "WhatsApp security",
            [
              `${change.value.display_phone_number}: ${change.value.event}`,
              change.value.requester,
            ]
              .filter(isNonEmptyString)
              .join(", requested by "),
          );
          break;
        case "smb_app_state_sync":
          break;
        case "smb_message_echoes": {
          const { metadata, message_echoes } = change.value;
          await enqueueParseMessageJobs(
            message_echoes.map((echo) => ({
              whatsAppBusinessAccountId: entry.id,
              businessData: metadata,
              contacts: { wa_id: echo.to, user_id: echo.to_user_id, profile: { name: '' } },
              messages: echo,
            })),
          );
          break;
        }
        case "template_category_update":
          await syncTemplate(change.value.message_template_id);
          break;
        case "user_preferences":
          for (const preference of change.value.user_preferences) {
            const identity = { whatsAppId: preference.wa_id, whatsAppUserId: preference.user_id };

            await updateWhatsAppMarketingPreference({
              identity,
              name: change.value.contacts?.find((contact) =>
                isSameWhatsAppIdentity({ whatsAppId: contact.wa_id, whatsAppUserId: contact.user_id }, identity),
              )?.profile?.name,
              isOptedOut: preference.value === 'stop',
              updatedAt: parseWhatsAppTimestamp(preference.timestamp),
            });
          }
          break;
        case "messages": {
          if ('errors' in change.value) {
            console.error(`WhatsApp reported errors for business account ${entry.id}`, change.value.errors);
            break;
          }
          if ('statuses' in change.value) {
            const { metadata, statuses } = change.value;
            await enqueueLogicFunctionJobs<UpdateMessageStatusPayload>({
              logicFunctionUniversalIdentifier: WHATSAPP_LOGIC_FUNCTION_UPDATE_MESSAGE_STATUS_UNIVERSAL_IDENTIFIER,
              payloads: statuses.map((status) => ({
                whatsAppBusinessAccountId: entry.id,
                displayPhoneNumber: metadata.display_phone_number,
                status,
              })),
              getJobKey: ({ status }) => `${status.id}:${status.status}`,
            });
            break;
          }
          if ('messages' in change.value) {
            const { metadata, contacts, messages } = change.value;
            await enqueueParseMessageJobs(
              messages.map((message) => ({
                whatsAppBusinessAccountId: entry.id,
                businessData: metadata,
                contacts:
                  contacts?.find(
                    (contact) =>
                      (isDefined(message.from_user_id) && contact.user_id === message.from_user_id) ||
                      (isDefined(message.from) && contact.wa_id === message.from),
                  ) ?? contacts?.[0],
                messages: message,
              })),
            );
          }
        }
      }
    }
  }
  return {
    success: true,
  };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_WEBHOOK_SYNC_UNIVERSAL_IDENTIFIER,
  name: 'webhook-sync',
  description: 'Receives WhatsApp webhooks, imports messages and templates, and forwards account alerts to the inbox',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/whatsapp',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['x-hub-signature-256']
  },
});
