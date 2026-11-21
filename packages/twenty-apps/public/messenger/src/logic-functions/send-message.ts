import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type SendAppMessagePayload,
  type SendAppMessageResult,
} from 'twenty-sdk/logic-function';

import { MESSENGER_LOGIC_FUNCTION_SEND_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildFailedReplyNotificationText } from 'src/logic-functions/data/build-failed-reply-notification-text.util';
import { sendInboxNotification } from 'src/logic-functions/data/send-inbox-notification.util';
import { sendMessengerReply } from 'src/logic-functions/data/send-messenger-reply.util';

// the sender sees the error in Twenty; the chosen members also hear about replies sent by agents or workflows
const handler = async (
  payload: SendAppMessagePayload,
): Promise<SendAppMessageResult> => {
  try {
    return await sendMessengerReply({
      ...payload,
      isHumanAgentTagAllowed: true,
    });
  } catch (error) {
    const [recipient] = payload.recipients;

    await sendInboxNotification({
      threadKey: `reply_failed:${payload.messageChannelId}`,
      idempotencyKey: `reply_failed:${payload.idempotencyKey}`,
      title: 'Messenger reply not sent',
      text: buildFailedReplyNotificationText({
        recipientName:
          recipient?.displayName ?? recipient?.handle ?? payload.threadExternalId,
        reason: error instanceof Error ? error.message : String(error),
        replyText: payload.text,
      }),
    });

    throw error;
  }
};

export default defineLogicFunction({
  universalIdentifier: MESSENGER_LOGIC_FUNCTION_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'send-message',
  description:
    'Sends a reply written in Twenty, with its attachments, to its Messenger conversation: a standard reply within 24 hours, with the human agent tag up to 7 days',
  timeoutSeconds: 60,
  handler,
});
