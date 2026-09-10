import { SLACK_ASSISTANT_EXPIRED_THREAD_TEXT } from 'src/logic-functions/constants/slack-assistant-expired-thread-text';
import { slackPostEphemeralMessageHandler } from 'src/logic-functions/handlers/slack-post-ephemeral-message-handler';
import { type SlackThreadReference } from 'src/logic-functions/types/slack-thread-reference.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';

export const nudgeExpiredSlackThread = async ({
  channelId,
  threadTimestamp,
  slackUserId,
}: SlackThreadReference & {
  slackUserId: string;
}): Promise<SlackToolResult> =>
  await slackPostEphemeralMessageHandler({
    slackChannelId: channelId,
    recipientSlackUserId: slackUserId,
    messageText: SLACK_ASSISTANT_EXPIRED_THREAD_TEXT,
    parentMessageTimestamp: threadTimestamp,
  });
