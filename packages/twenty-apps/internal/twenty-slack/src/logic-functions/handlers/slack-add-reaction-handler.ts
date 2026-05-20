import { type SlackAddReactionInput } from 'src/logic-functions/types/slack-add-reaction-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { slackToolFailure } from 'src/logic-functions/utils/slack-tool-failure';

export const slackAddReactionHandler = async (
  parameters: SlackAddReactionInput,
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
    await client.reactions.add({
      channel: parameters.slackChannelId,
      timestamp: parameters.messageTimestamp,
      name: parameters.emojiName.trim(),
    });

    return {
      success: true,
      message: `Reaction "${parameters.emojiName.trim()}" added to the message.`,
      slackTs: parameters.messageTimestamp,
      channel: parameters.slackChannelId,
    };
  } catch (error) {
    return slackToolFailure('Failed to add Slack reaction', error);
  }
};
