import type { ChatUpdateArguments } from '@slack/web-api';
import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_UPDATE_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { slackUpdateMessageInputSchema } from './schemas/slack-update-message-input.schema';
import { type SlackUpdateMessageInput } from './types/slack-update-message-input.type';
import { type SlackToolResult } from './types/slack-tool-result.type';
import { createSlackWebClient } from '../utils/create-slack-web-client';
import { getSlackErrorMessage } from '../utils/get-slack-error-message';
import { validateSlackMessageText } from '../utils/slack-text';

const handler = async (
  parameters: SlackUpdateMessageInput,
): Promise<SlackToolResult> => {
  const connectionResult = await getSlackConnection();

  if (!connectionResult.success) {
    return {
      success: false,
      message: 'Slack is not connected',
      error: connectionResult.error,
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

  const client = createSlackWebClient(connectionResult.accessToken);

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
  universalIdentifier: SLACK_UPDATE_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'slack_update_message',
  description:
    'Change the text of a message this bot already sent. You need the channel ID and the message’s timestamp from when it was posted.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: slackUpdateMessageInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Update Slack Message',
    icon: 'IconBrandSlack',
    inputSchema: [
      {
        type: 'object',
        properties: {
          slack_channel_id: { type: 'string' },
          message_timestamp: { type: 'string' },
          new_message_text: { type: 'string' },
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
