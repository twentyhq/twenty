import { SLACK_ASSISTANT_EXPIRED_THREAD_TEXT } from 'src/logic-functions/constants/slack-assistant-expired-thread-text';
import { slackPostEphemeralMessageHandler } from 'src/logic-functions/handlers/slack-post-ephemeral-message-handler';

export const nudgeExpiredSlackThread = async ({
  slackChannelId,
  slackUserId,
  threadTimestamp,
}: {
  slackChannelId: string;
  slackUserId: string;
  threadTimestamp: string;
}): Promise<void> => {
  await slackPostEphemeralMessageHandler({
    slackChannelId,
    recipientSlackUserId: slackUserId,
    messageText: SLACK_ASSISTANT_EXPIRED_THREAD_TEXT,
    parentMessageTimestamp: threadTimestamp,
  });
};
