import { type SlackPostMessageInput } from 'src/logic-functions/types/slack-post-message-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { sendSlackMessageWithMarkdownFallback } from 'src/logic-functions/utils/send-slack-message-with-markdown-fallback';

export const slackPostMessageHandler = async (
  parameters: SlackPostMessageInput,
): Promise<SlackToolResult> => {
  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return {
      success: false,
      message: 'Slack is not connected',
      error: slackClientResult.error,
    };
  }

  const { client } = slackClientResult;

  const parentTimestamp = parameters.parentMessageTimestamp;

  return await sendSlackMessageWithMarkdownFallback({
    messageText: parameters.messageText,
    messageFormat: parameters.messageFormat,
    failureMessage: 'Failed to post Slack message',
    sendMessage: async (bodyFields) => {
      const data = await client.chat.postMessage({
        channel: parameters.slackChannelId,
        thread_ts:
          parentTimestamp != null && parentTimestamp.trim().length > 0
            ? parentTimestamp.trim()
            : undefined,
        ...bodyFields,
      });

      return {
        success: true,
        message: data.ts
          ? `Message posted to Slack (ts=${data.ts}).`
          : 'Message posted to Slack.',
        slackTs: data.ts,
        channel: data.channel,
      };
    },
  });
};
