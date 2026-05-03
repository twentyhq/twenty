import type { ChatUpdateArguments } from '@slack/web-api';
import { defineLogicFunction } from 'twenty-sdk/define';

import { slackUpdateMessageInputSchema } from './schemas/slack-update-message-input.schema';
import { type SlackUpdateMessageInput } from './types/slack-update-message-input.type';
import { type SlackToolResult } from './types/slack-tool-result.type';
import { createSlackWebClient } from '../utils/create-slack-web-client';
import { getSlackErrorMessage } from '../utils/get-slack-error-message';
import { validateSlackMessageText } from '../utils/slack-text';

const handler = async (
  parameters: SlackUpdateMessageInput,
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

  const textError = validateSlackMessageText(parameters.new_message_text);

  if (textError) {
    return {
      success: false,
      message: 'Invalid message text',
      error: textError,
    };
  }

  const client = createSlackWebClient(botToken);

  try {
    // `mrkdwn` is supported by the Slack API but missing from ChatUpdateArguments in @slack/web-api.
    const updatePayload = {
      channel: parameters.slack_channel_id,
      ts: parameters.message_timestamp,
      text: parameters.new_message_text,
      ...(parameters.use_slack_markdown === true
        ? { mrkdwn: true as const }
        : {}),
    } as ChatUpdateArguments & { mrkdwn?: boolean };

    const data = await client.chat.update(updatePayload);

    const slackTs =
      typeof data.ts === 'string' ? data.ts : parameters.message_timestamp;

    return {
      success: true,
      message: 'Slack message updated.',
      slackTs,
      channel: parameters.slack_channel_id,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to update Slack message',
      error: getSlackErrorMessage(error),
    };
  }
};

export default defineLogicFunction({
  universalIdentifier: 'e4d03b87-9a5b-4f1d-8b20-58ca3917620d',
  name: 'slack_update_message',
  description:
    'Change the text of a message this bot already sent. You need the channel ID and the message’s timestamp from when it was posted.',
  timeoutSeconds: 30,
  isTool: true,
  toolInputSchema: slackUpdateMessageInputSchema,
  handler,
});
