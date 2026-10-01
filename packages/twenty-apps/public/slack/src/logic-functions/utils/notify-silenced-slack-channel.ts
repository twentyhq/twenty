import { SLACK_CHANNEL_SILENCED_TEXT } from 'src/logic-functions/constants/slack-channel-silenced-text';
import { slackPostEphemeralMessageHandler } from 'src/logic-functions/handlers/slack-post-ephemeral-message-handler';

export const notifySilencedSlackChannel = async ({
  slackChannelId,
  slackUserId,
  parentMessageTimestamp,
}: {
  slackChannelId: string;
  slackUserId: string;
  parentMessageTimestamp: string | undefined;
}): Promise<void> => {
  await slackPostEphemeralMessageHandler({
    slackChannelId,
    recipientSlackUserId: slackUserId,
    messageText: SLACK_CHANNEL_SILENCED_TEXT,
    parentMessageTimestamp,
  });
};
