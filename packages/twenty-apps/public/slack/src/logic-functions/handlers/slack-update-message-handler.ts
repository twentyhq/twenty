import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { type SlackUpdateMessageInput } from 'src/logic-functions/types/slack-update-message-input.type';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { sendSlackMessageWithBodyFallbacks } from 'src/logic-functions/utils/send-slack-message-with-body-fallbacks';

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

  return await sendSlackMessageWithBodyFallbacks({
    messageText: parameters.newMessageText,
    messageBody: {
      messageFormat: parameters.messageFormat,
      messageBlocks: parameters.messageBlocks,
    },
    failureMessage: 'Failed to update Slack message',
    sendMessage: async (bodyFields) => {
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
