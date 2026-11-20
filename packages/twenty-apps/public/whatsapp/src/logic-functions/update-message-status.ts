import { defineLogicFunction } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';
import { WHATSAPP_MARKETING_OPT_OUT_ERROR_CODE } from 'src/constants/whatsapp-marketing-opt-out-error-code.constant';
import { WHATSAPP_LOGIC_FUNCTION_UPDATE_MESSAGE_STATUS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildFailedWhatsAppMessageNotificationText } from 'src/logic-functions/data/build-failed-whatsapp-message-notification-text.util';
import { parseWhatsAppTimestamp } from 'src/logic-functions/data/parse-whatsapp-timestamp.util';
import { scheduleWhatsAppCampaignRefresh } from 'src/logic-functions/data/schedule-whatsapp-campaign-refresh.util';
import { sendInboxNotification } from 'src/logic-functions/data/send-inbox-notification.util';
import { updateWhatsAppMarketingPreference } from 'src/logic-functions/data/update-whatsapp-marketing-preference.util';
import { updateWhatsAppMessageStatus } from 'src/logic-functions/data/update-whatsapp-message-status.util';
import { type UpdateMessageStatusPayload } from 'src/logic-functions/types/update-message-status-payload.type';

const handler = async ({ whatsAppBusinessAccountId, displayPhoneNumber, status }: UpdateMessageStatusPayload) => {
  const updatedMessage = await updateWhatsAppMessageStatus({
    displayPhoneNumber,
    messageExternalId: status.id,
    reportedStatus: status.status,
    errors: status.errors,
  });

  if (isDefined(updatedMessage?.campaignId)) {
    await scheduleWhatsAppCampaignRefresh([updatedMessage.campaignId]);
  }

  if (status.status !== 'failed') {
    return;
  }

  // covers users who stopped marketing messages before the app was connected
  if (status.errors?.some(({ code }) => code === WHATSAPP_MARKETING_OPT_OUT_ERROR_CODE)) {
    await updateWhatsAppMarketingPreference({
      identity: { whatsAppId: status.recipient_id, whatsAppUserId: status.recipient_user_id },
      isOptedOut: true,
      updatedAt: parseWhatsAppTimestamp(status.timestamp),
    });
  }

  if (isDefined(updatedMessage)) {
    await sendInboxNotification({
      threadKey: `message_failed:${whatsAppBusinessAccountId}`,
      idempotencyKey: `message_failed:${status.id}`,
      title: 'WhatsApp message not delivered',
      text: buildFailedWhatsAppMessageNotificationText({
        recipient: status.recipient_id ?? status.recipient_user_id,
        statusError: updatedMessage.statusError,
        messageText: updatedMessage.text,
      }),
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_UPDATE_MESSAGE_STATUS_UNIVERSAL_IDENTIFIER,
  name: 'update-message-status',
  description:
    'Applies a WhatsApp delivery status to its message, and notifies the chosen members when a message is not delivered',
  timeoutSeconds: 60,
  handler,
});
