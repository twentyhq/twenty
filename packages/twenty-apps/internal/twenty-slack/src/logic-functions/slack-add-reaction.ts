import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_ADD_REACTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { slackAddReactionInputSchema } from './schemas/slack-add-reaction-input.schema';
import { type SlackAddReactionInput } from './types/slack-add-reaction-input.type';
import { type SlackToolResult } from './types/slack-tool-result.type';
import { createSlackWebClient } from '../utils/create-slack-web-client';
import { getSlackErrorMessage } from '../utils/get-slack-error-message';
import { validateReactionName } from '../utils/reaction-name';

const handler = async (
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

  const reactionError = validateReactionName(parameters.emoji_name);

  if (reactionError) {
    return {
      success: false,
      message: 'Invalid reaction name',
      error: reactionError,
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

export default defineLogicFunction({
  universalIdentifier: SLACK_ADD_REACTION_UNIVERSAL_IDENTIFIER,
  name: 'slack_add_reaction',
  description:
    'Add an emoji reaction to a message (for example a checkmark as `white_check_mark`) so the channel can see status at a glance.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: slackAddReactionInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Add Slack Reaction',
    icon: 'IconBrandSlack',
    inputSchema: [
      {
        type: 'object',
        properties: {
          slack_channel_id: { type: 'string' },
          message_timestamp: { type: 'string' },
          emoji_name: { type: 'string' },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          error: { type: 'string' },
          slackTs: { type: 'string' },
          channel: { type: 'string' },
        },
      },
    ],
  },
  handler,
});
