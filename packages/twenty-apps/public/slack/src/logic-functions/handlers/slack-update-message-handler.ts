import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { type SlackUpdateMessageInput } from 'src/logic-functions/types/slack-update-message-input.type';
import { getSlackChatMessageBodyFields } from 'src/logic-functions/utils/get-slack-chat-message-body-fields';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { sendSlackMessageWithMarkdownFallback } from 'src/logic-functions/utils/send-slack-message-with-markdown-fallback';

export const slackUpdateMessageHandler = async (
  parameters: SlackUpdateMessageInput,
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

  return await sendSlackMessageWithMarkdownFallback({
    messageFormat: parameters.messageFormat,
    failureMessage: 'Failed to update Slack message',
    sendMessage: async (messageFormat) => {
      const bodyFields = getSlackChatMessageBodyFields(
        parameters.newMessageText,
        messageFormat,
      );

      const data = await client.chat.update({
        channel: parameters.slackChannelId,
        ts: parameters.messageTimestamp,
        ...bodyFields,
      });

      return {
        success: true,
        message: 'Slack message updated.',
        slackTs: data.ts,
        channel: parameters.slackChannelId,
      };
    },
  });
};
