import { SLACK_ASSISTANT_EXPIRED_THREAD_TEXT } from 'src/logic-functions/constants/slack-assistant-expired-thread-text';
import { slackPostEphemeralMessageHandler } from 'src/logic-functions/handlers/slack-post-ephemeral-message-handler';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';

export const nudgeExpiredSlackThread = async ({
  slackChannelId,
  slackUserId,
  threadTimestamp,
}: {
  slackChannelId: string;
  slackUserId: string;
  threadTimestamp: string;
}): Promise<SlackToolResult> =>
  await slackPostEphemeralMessageHandler({
    slackChannelId,
    recipientSlackUserId: slackUserId,
    messageText: SLACK_ASSISTANT_EXPIRED_THREAD_TEXT,
    parentMessageTimestamp: threadTimestamp,
  });
