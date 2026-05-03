import { defineLogicFunction } from 'twenty-sdk/define';

import { slackPostMessageInputSchema } from './schemas/slack-post-message-input.schema';
import { type SlackPostMessageInput } from './types/slack-post-message-input.type';
import { type SlackToolResult } from './types/slack-tool-result.type';
import { createSlackWebClient } from '../utils/create-slack-web-client';
import { getSlackErrorMessage } from '../utils/get-slack-error-message';
import { validateSlackMessageText } from '../utils/slack-text';

const handler = async (
  parameters: SlackPostMessageInput,
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
    const data = await client.chat.postMessage({
      channel: parameters.channel,
      text: parameters.text,
      thread_ts:
        parameters.thread_ts !== undefined && parameters.thread_ts.length > 0
          ? parameters.thread_ts
          : undefined,
      mrkdwn: parameters.mrkdwn === true ? true : undefined,
    });

    const slackTs = typeof data.ts === 'string' ? data.ts : undefined;
    const channel =
      typeof data.channel === 'string' ? data.channel : parameters.channel;

    return {
      success: true,
      message: slackTs
        ? `Message posted to Slack (ts=${slackTs}).`
        : 'Message posted to Slack.',
      slackTs,
      channel,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to post Slack message',
      error: getSlackErrorMessage(error),
    };
  }
};

export default defineLogicFunction({
  universalIdentifier: 'c6f25d09-1b7c-4e3f-ad42-7aec5b29830f',
  name: 'slack_post_message',
  description:
    'Post a message to a Slack channel or DM. Supports optional thread replies and mrkdwn-rich text when enabled.',
  timeoutSeconds: 30,
  isTool: true,
  toolInputSchema: slackPostMessageInputSchema,
  handler,
});
