import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

import { type SlackPostMessageInput } from 'src/logic-functions/types/slack-post-message-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { sendSlackMessageWithBodyFallbacks } from 'src/logic-functions/utils/send-slack-message-with-body-fallbacks';

export const postSlackMessage = async (
  client: WebClient,
  parameters: SlackPostMessageInput,
): Promise<SlackToolResult> => {
  const parentTimestamp = isNonEmptyString(parameters.parentMessageTimestamp)
    ? parameters.parentMessageTimestamp.trim() || undefined
    : undefined;

  return await sendSlackMessageWithBodyFallbacks({
    messageText: parameters.messageText,
    messageBody: {
      messageFormat: parameters.messageFormat,
      messageBlocks: parameters.messageBlocks,
    },
    failureMessage: 'Failed to post Slack message',
    sendMessage: async (bodyFields) => {
      const data = await client.chat.postMessage({
        channel: parameters.slackChannelId,
        thread_ts: parentTimestamp,
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
