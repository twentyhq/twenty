import { type WebClient } from '@slack/web-api';

import { type SlackPostMessageInput } from 'src/logic-functions/types/slack-post-message-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { getSlackChatMessageBodyFields } from 'src/logic-functions/utils/get-slack-chat-message-body-fields';
import { sendSlackMessageWithMarkdownFallback } from 'src/logic-functions/utils/send-slack-message-with-markdown-fallback';

export const postSlackMessage = async (
  client: WebClient,
  parameters: SlackPostMessageInput,
): Promise<SlackToolResult> => {
  const parentTimestamp = parameters.parentMessageTimestamp;

  return await sendSlackMessageWithMarkdownFallback({
    messageFormat: parameters.messageFormat,
    failureMessage: 'Failed to post Slack message',
    sendMessage: async (messageFormat) => {
      const bodyFields = getSlackChatMessageBodyFields(
        parameters.messageText,
        messageFormat,
      );

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
