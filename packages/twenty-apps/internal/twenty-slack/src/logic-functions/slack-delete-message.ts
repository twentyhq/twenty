import { defineLogicFunction } from 'twenty-sdk/define';

import { slackDeleteMessageInputSchema } from './schemas/slack-delete-message-input.schema';
import { type SlackDeleteMessageInput } from './types/slack-delete-message-input.type';
import { type SlackToolResult } from './types/slack-tool-result.type';
import { createSlackWebClient } from '../utils/create-slack-web-client';
import { getSlackErrorMessage } from '../utils/get-slack-error-message';

const handler = async (
  parameters: SlackDeleteMessageInput,
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

  const client = createSlackWebClient(botToken);

  try {
    await client.chat.delete({
      channel: parameters.channel,
      ts: parameters.ts,
    });

    return {
      success: true,
      message: 'Slack message deleted.',
      slackTs: parameters.ts,
      channel: parameters.channel,
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
  universalIdentifier: 'f3c92a76-8b4a-1c09-ba19-47b9280651c9',
  name: 'slack_delete_message',
  description:
    'Delete a Slack message sent by this bot (chat.delete). Requires channel ID and message ts.',
  timeoutSeconds: 30,
  isTool: true,
  toolInputSchema: slackDeleteMessageInputSchema,
  handler,
});
