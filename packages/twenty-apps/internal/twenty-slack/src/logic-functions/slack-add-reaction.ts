import { defineLogicFunction } from 'twenty-sdk/define';

import { slackAddReactionInputSchema } from './schemas/slack-add-reaction-input.schema';
import { type SlackAddReactionInput } from './types/slack-add-reaction-input.type';
import { type SlackToolResult } from './types/slack-tool-result.type';
import { createSlackWebClient } from '../utils/create-slack-web-client';
import { getSlackErrorMessage } from '../utils/get-slack-error-message';
import { validateReactionName } from '../utils/reaction-name';

const handler = async (
  parameters: SlackAddReactionInput,
): Promise<SlackToolResult> => {
  const botToken = process.env.SLACK_BOT_TOKEN;

  if (!botToken) {
    return {
      success: false,
      message: 'Slack is not configured',
      error:
        'SLACK_BOT_TOKEN is not set. The server admin must configure the Slack bot token for this app registration.',
    };
  }

  const reactionError = validateReactionName(parameters.emoji_name);

  if (reactionError) {
    return {
      success: false,
      message: 'Invalid reaction name',
      error: reactionError,
    };
  }

  const client = createSlackWebClient(botToken);

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

export default defineLogicFunction({
  universalIdentifier: '2a8c7f91-4d3e-5b6f-a7c8-9d0e1f2a3b4c',
  name: 'slack_add_reaction',
  description:
    'Add an emoji reaction to a message (for example a checkmark as `white_check_mark`) so the channel can see status at a glance.',
  timeoutSeconds: 30,
  isTool: true,
  toolInputSchema: slackAddReactionInputSchema,
  handler,
});
