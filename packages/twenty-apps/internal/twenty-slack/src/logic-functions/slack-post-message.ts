import { defineLogicFunction } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';

import { SLACK_POST_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { createSlackWebClient } from '../utils/create-slack-web-client';
import { getSlackErrorMessage } from '../utils/get-slack-error-message';
import { validateSlackMessageText } from '../utils/slack-text';
import { slackPostMessageInputSchema } from './schemas/slack-post-message-input.schema';
import { type SlackPostMessageInput } from './types/slack-post-message-input.type';
import { type SlackToolResult } from './types/slack-tool-result.type';

const handler = async (
  parameters: SlackPostMessageInput,
): Promise<SlackToolResult> => {
  const connectionResult = await getSlackConnection();

  if (!connectionResult.success) {
    return {
      success: false,
      message: 'Slack is not connected',
      error: connectionResult.error,
    };
  }

  const textError = validateSlackMessageText(parameters.message_text);

  if (textError) {
    return {
      success: false,
      message: 'Invalid message text',
      error: textError,
    };
  }

  const client = createSlackWebClient(connectionResult.accessToken);

  const parentTimestamp = parameters.parent_message_timestamp;

  try {
    const data = await client.chat.postMessage({
      channel: parameters.slack_channel_id,
      text: parameters.message_text,
      thread_ts:
        isDefined(parentTimestamp) && parentTimestamp.trim().length > 0
          ? parentTimestamp.trim()
          : undefined,
      mrkdwn: parameters.use_slack_markdown === true ? true : undefined,
    });

    const slackTs = typeof data.ts === 'string' ? data.ts : undefined;
    const channel =
      typeof data.channel === 'string'
        ? data.channel
        : parameters.slack_channel_id;

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
  universalIdentifier: SLACK_POST_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'slack_post_message',
  description:
    'Send a message to a Slack channel or DM. Optionally reply inside an existing thread using the parent message’s timestamp from a previous step.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: slackPostMessageInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Send Slack Message',
    icon: 'IconBrandSlack',
    inputSchema: [
      {
        type: 'object',
        properties: {
          slack_channel_id: { type: 'string' },
          message_text: { type: 'string' },
          parent_message_timestamp: { type: 'string' },
          use_slack_markdown: { type: 'boolean' },
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
