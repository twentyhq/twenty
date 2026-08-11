import { type SlackDeleteMessageInput } from 'src/logic-functions/types/slack-delete-message-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { slackToolFailure } from 'src/logic-functions/utils/slack-tool-failure';

export const slackDeleteMessageHandler = async (
  parameters: SlackDeleteMessageInput,
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

  try {
    await client.chat.delete({
      channel: parameters.slackChannelId,
      ts: parameters.messageTimestamp,
    });

    return {
      success: true,
      message: 'Slack message deleted.',
      slackTs: parameters.messageTimestamp,
      channel: parameters.slackChannelId,
    };
  } catch (error) {
    return slackToolFailure('Failed to delete Slack message', error);
  }
};
