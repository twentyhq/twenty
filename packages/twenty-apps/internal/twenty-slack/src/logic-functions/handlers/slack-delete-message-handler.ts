import { type SlackDeleteMessageInput } from 'src/logic-functions/types/slack-delete-message-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { createSlackWebClient } from 'src/utils/create-slack-web-client';
import { getSlackErrorMessage } from 'src/utils/get-slack-error-message';

export const slackDeleteMessageHandler = async (
  parameters: SlackDeleteMessageInput,
): Promise<SlackToolResult> => {
  const connectionResult = await getSlackConnection();

  if (!connectionResult.success) {
    return {
      success: false,
      message: 'Slack is not connected',
      error: connectionResult.error,
    };
  }

  const client = createSlackWebClient(connectionResult.accessToken);

  try {
    await client.chat.delete({
      channel: parameters.slack_channel_id,
      ts: parameters.message_timestamp,
    });

    return {
      success: true,
      message: 'Slack message deleted.',
      slackTs: parameters.message_timestamp,
      channel: parameters.slack_channel_id,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to delete Slack message',
      error: getSlackErrorMessage(error),
    };
  }
};
