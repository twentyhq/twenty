import type { ChatPostEphemeralArguments } from '@slack/web-api';
import { defineLogicFunction } from 'twenty-sdk/define';

import { slackPostEphemeralMessageInputSchema } from './schemas/slack-post-ephemeral-message-input.schema';
import { type SlackPostEphemeralMessageInput } from './types/slack-post-ephemeral-message-input.type';
import { type SlackToolResult } from './types/slack-tool-result.type';
import { createSlackWebClient } from '../utils/create-slack-web-client';
import { getSlackErrorMessage } from '../utils/get-slack-error-message';
import { validateSlackMessageText } from '../utils/slack-text';

const handler = async (
  parameters: SlackPostEphemeralMessageInput,
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

  const textError = validateSlackMessageText(parameters.text);

  if (textError) {
    return {
      success: false,
      message: 'Invalid message text',
      error: textError,
    };
  }

  const client = createSlackWebClient(botToken);

  try {
    // `mrkdwn` is supported by the Slack API but missing from ChatPostEphemeralArguments in @slack/web-api.
    const postEphemeralPayload = {
      channel: parameters.channel,
      user: parameters.user,
      text: parameters.text,
      ...(parameters.mrkdwn === true ? { mrkdwn: true as const } : {}),
    } as ChatPostEphemeralArguments & { mrkdwn?: boolean };

    await client.chat.postEphemeral(postEphemeralPayload);

    return {
      success: true,
      message: 'Ephemeral message sent to the user in the channel.',
      channel: parameters.channel,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to post Slack ephemeral message',
      error: getSlackErrorMessage(error),
    };
  }
};

export default defineLogicFunction({
  universalIdentifier: 'd5e14c98-0a6b-4e2e-ac31-69db4a18720e',
  name: 'slack_post_ephemeral_message',
  description:
    'Post a temporary Slack message visible only to one user in a channel (chat.postEphemeral).',
  timeoutSeconds: 30,
  isTool: true,
  toolInputSchema: slackPostEphemeralMessageInputSchema,
  handler,
});
