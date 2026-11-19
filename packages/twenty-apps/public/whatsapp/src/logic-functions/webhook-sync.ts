import { defineLogicFunction, RoutePayload } from 'twenty-sdk/define';
import { WhatsAppWebhook } from 'src/logic-functions/types/whatsapp-webhook-message.type';
import { validateWebhookPayload } from 'src/logic-functions/data/validate-webhook-payload.util';
import { enqueueJobs } from "twenty-sdk/logic-function";
import {
  WHATSAPP_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER,
  WHATSAPP_LOGIC_FUNCTION_WEBHOOK_SYNC_UNIVERSAL_IDENTIFIER
} from "src/constants/universal-identifiers";
import { updateTwentyMessageChannel } from "src/logic-functions/data/update-message-channel.util";
import { upsertWhatsAppTemplate } from "src/logic-functions/data/upsert-whatsapp-template.util";
import { buildHistoryParseJobs } from "src/logic-functions/data/build-history-parse-jobs.util";
import { isNonEmptyString } from "@sniptt/guards";
import { sendInboxNotification } from "src/logic-functions/data/send-inbox-notification.util";

const handler = async (
  params: RoutePayload<WhatsAppWebhook>,
): Promise<object> => {
  if (!process.env.WEBHOOK_VALIDATION_SECRET || !process.env.ACCESS_TOKEN) {
    return {
      success: false,
    };
  }

  const { rawBody, body, headers } = params;
  if (rawBody === undefined || body === null || body?.entry === undefined || body.object !== 'whatsapp_business_account') {
    return {
      success: false,
    };
  }

  const signature = headers['x-hub-signature-256'];
  if (!signature || signature === '') {
    return {
      success: false,
    };
  }

  if (
    !validateWebhookPayload(
      signature,
      rawBody,
      process.env.WEBHOOK_VALIDATION_SECRET,
    )
  ) {
    return {
      success: false,
    };
  }

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
          await upsertWhatsAppTemplate({
            metaTemplateId: change.value.message_template_id,
            name: change.value.message_template_name,
            language: change.value.message_template_language,
          });
          break;
        case "message_template_quality_update":
          await upsertWhatsAppTemplate({
            metaTemplateId: change.value.message_template_id,
            name: change.value.message_template_name,
            language: change.value.message_template_language,
            quality: change.value.new_quality_score,
          });
          break;
        case "message_template_status_update":
          await upsertWhatsAppTemplate({
            metaTemplateId: change.value.message_template_id,
            name: change.value.message_template_name,
            language: change.value.message_template_language,
            category: change.value.message_template_category,
            status: change.value.event,
            rejectedReason:
              change.value.rejection_info?.reason ??
              (change.value.reason === null || change.value.reason === 'NONE'
                ? null
                : change.value.reason),
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
          await upsertWhatsAppTemplate({
            metaTemplateId: change.value.message_template_id,
            name: change.value.message_template_name,
            language: change.value.message_template_language,
            category: change.value.new_category,
          });
          break;
        case "user_preferences":
          return {
            success: false,
          }
        case "messages": {
          if ('errors' in change.value) {
            return {
              success: false,
            }
          }
          if ('statuses' in change.value) {
            return {
              success: false,
            }
          }
          if ('messages' in change.value) {
            await enqueueJobs({
              logicFunctionUniversalIdentifier: WHATSAPP_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER,
              retryLimit: 3,
              delayMs: 500,
              jobs: [{
                payload: {
                  businessData: change.value.metadata,
                  contacts: change.value.contacts[0],
                  messages: change.value.messages,
                }
              }]
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
