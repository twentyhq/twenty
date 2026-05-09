import type { ChatPostEphemeralArguments } from '@slack/web-api';

import { type SlackPostEphemeralMessageInput } from 'src/logic-functions/types/slack-post-ephemeral-message-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { createSlackWebClient } from 'src/utils/create-slack-web-client';
import { getSlackErrorMessage } from 'src/utils/get-slack-error-message';
import { validateSlackMessageText } from 'src/utils/slack-text';

export const slackPostEphemeralMessageHandler = async (
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
