import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_DELETE_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { slackDeleteMessageInputSchema } from './schemas/slack-delete-message-input.schema';
import { type SlackDeleteMessageInput } from './types/slack-delete-message-input.type';
import { type SlackToolResult } from './types/slack-tool-result.type';
import { createSlackWebClient } from '../utils/create-slack-web-client';
import { getSlackErrorMessage } from '../utils/get-slack-error-message';

const handler = async (
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

export default defineLogicFunction({
  universalIdentifier: SLACK_DELETE_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'slack_delete_message',
  description:
    'Remove a message this bot sent (for example after a mistake or when a workflow is cancelled).',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: slackDeleteMessageInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Delete Slack Message',
    icon: 'IconBrandSlack',
    inputSchema: [
      {
        type: 'object',
        properties: {
          slack_channel_id: { type: 'string' },
          message_timestamp: { type: 'string' },
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
