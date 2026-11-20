import { defineLogicFunction, RoutePayload } from 'twenty-sdk/define';
import { WhatsAppWebhook } from 'src/logic-functions/types/whatsapp-webhook-message.type';
import { validateWebhookPayload } from 'src/logic-functions/data/validate-webhook-payload.util';
import { enqueueJobs, Response } from "twenty-sdk/logic-function";
import {
  WHATSAPP_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER,
  WHATSAPP_LOGIC_FUNCTION_WEBHOOK_SYNC_UNIVERSAL_IDENTIFIER
} from "src/constants/universal-identifiers";
import { updateTwentyMessageChannel } from "src/logic-functions/data/update-message-channel.util";
import { upsertWhatsAppTemplates } from "src/logic-functions/data/upsert-whatsapp-templates.util";
import { syncWhatsappTemplate } from "src/logic-functions/data/sync-whatsapp-template.util";
import { getWhatsappAccessTokenOrThrow } from "src/logic-functions/data/get-whatsapp-access-token-or-throw.util";
import { buildHistoryParseJobs } from "src/logic-functions/data/build-history-parse-jobs.util";
import { isNonEmptyString } from "@sniptt/guards";
import { sendInboxNotification } from "src/logic-functions/data/send-inbox-notification.util";

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
    !validateWebhookPayload(signature, rawBody, process.env.WEBHOOK_VALIDATION_SECRET)
  ) {
    return new Response('', { status: 401 });
  }

  if (body === null || body?.entry === undefined || body.object !== 'whatsapp_business_account') {
    return new Response('', { status: 400 });
  }

  let accessToken: string | undefined;
  const getAccessToken = async () => (accessToken ??= await getWhatsappAccessTokenOrThrow());

  for (const entry of body.entry) {
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
          const jobs = buildHistoryParseJobs(change.value.metadata, change.value.history);
          if (jobs.length > 0) {
            await enqueueJobs({
              logicFunctionUniversalIdentifier: WHATSAPP_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER,
              retryLimit: 3,
              delayMs: 500,
              jobs,
            });
          }
          break;
        }
        case "message_template_components_update":
        case "message_template_quality_update":
          await syncWhatsappTemplate({
            accessToken: await getAccessToken(),
            metaTemplateId: String(change.value.message_template_id),
          });
          break;
        case "message_template_status_update":
          // a deleted template can no longer be fetched from Meta
          if (change.value.event === 'DELETED') {
            await upsertWhatsAppTemplates([
              {
                metaTemplateId: String(change.value.message_template_id),
                name: change.value.message_template_name,
                language: change.value.message_template_language,
                status: change.value.event,
              },
            ]);
            break;
          }
          await syncWhatsappTemplate({
            accessToken: await getAccessToken(),
            metaTemplateId: String(change.value.message_template_id),
          });
          break;
        case "partner_solutions":
        case "payment_configuration_update":
        case "phone_number_name_update":
          if ('a' in change.value) {
            await updateTwentyMessageChannel();
          }
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
        case "smb_message_echoes":
          break;
        case "template_category_update":
          await syncWhatsappTemplate({
            accessToken: await getAccessToken(),
            metaTemplateId: String(change.value.message_template_id),
          });
          break;
        case "user_preferences":
          break;
        case "messages": {
          if ('errors' in change.value) {
            break;
          }
          if ('statuses' in change.value) {
            break;
          }
          if ('messages' in change.value) {
            const { metadata, contacts, messages } = change.value;
            await enqueueJobs({
              logicFunctionUniversalIdentifier: WHATSAPP_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER,
              retryLimit: 3,
              delayMs: 500,
              jobs: messages.map((message) => ({
                payload: {
                  businessData: metadata,
                  contacts:
                    contacts?.find((contact) => contact.wa_id === message.from) ??
                    contacts?.[0],
                  messages: message,
                },
              })),
            })
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
  description: 'Receives webhook and ',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/whatsapp',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['x-hub-signature-256']
  },
});
