import { type SlackAddReactionInput } from 'src/logic-functions/types/slack-add-reaction-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { createSlackWebClient } from 'src/utils/create-slack-web-client';
import { getSlackErrorMessage } from 'src/utils/get-slack-error-message';

export const slackAddReactionHandler = async (
  parameters: SlackAddReactionInput,
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
    await client.reactions.add({
      channel: parameters.slack_channel_id,
      timestamp: parameters.message_timestamp,
      name: parameters.emoji_name.trim(),
    });

    return {
      success: true,
      message: `Reaction "${parameters.emoji_name.trim()}" added to the message.`,
      slackTs: parameters.message_timestamp,
      channel: parameters.slack_channel_id,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to add Slack reaction',
      error: getSlackErrorMessage(error),
    };
  }
};
