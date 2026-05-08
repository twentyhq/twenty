import type { ChatPostEphemeralArguments } from '@slack/web-api';
import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_POST_EPHEMERAL_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { slackPostEphemeralMessageInputSchema } from './schemas/slack-post-ephemeral-message-input.schema';
import { type SlackPostEphemeralMessageInput } from './types/slack-post-ephemeral-message-input.type';
import { type SlackToolResult } from './types/slack-tool-result.type';
import { createSlackWebClient } from '../utils/create-slack-web-client';
import { getSlackErrorMessage } from '../utils/get-slack-error-message';
import { validateSlackMessageText } from '../utils/slack-text';

const handler = async (
  parameters: SlackPostEphemeralMessageInput,
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

  try {
    // `mrkdwn` is supported by the Slack API but missing from ChatPostEphemeralArguments in @slack/web-api.
    const postEphemeralPayload = {
      channel: parameters.slack_channel_id,
      user: parameters.recipient_slack_user_id,
      text: parameters.message_text,
      ...(parameters.use_slack_markdown === true
        ? { mrkdwn: true as const }
        : {}),
    } as ChatPostEphemeralArguments & { mrkdwn?: boolean };

    await client.chat.postEphemeral(postEphemeralPayload);

    return {
      success: true,
      message: 'Ephemeral message sent to the user in the channel.',
      channel: parameters.slack_channel_id,
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
  universalIdentifier: SLACK_POST_EPHEMERAL_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'slack_post_ephemeral_message',
  description:
    'Send a private-on-channel note: only the chosen teammate sees it in that channel (not a DM broadcast to everyone).',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: slackPostEphemeralMessageInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Send Slack Ephemeral Message',
    icon: 'IconBrandSlack',
    inputSchema: [
      {
        type: 'object',
        properties: {
          slack_channel_id: { type: 'string' },
          recipient_slack_user_id: { type: 'string' },
          message_text: { type: 'string' },
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
          channel: { type: 'string' },
        },
      },
    ],
  },
  handler,
});
