import { WebClient } from '@slack/web-api';

import { type SlackAddReactionInput } from 'src/logic-functions/types/slack-add-reaction-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { slackToolFailure } from 'src/logic-functions/utils/slack-tool-failure';

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

  const client = new WebClient(connectionResult.accessToken);

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
