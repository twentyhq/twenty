import type { ChatUpdateArguments } from '@slack/web-api';

import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { type SlackUpdateMessageInput } from 'src/logic-functions/types/slack-update-message-input.type';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { createSlackWebClient } from 'src/utils/create-slack-web-client';
import { getSlackErrorMessage } from 'src/utils/get-slack-error-message';
import { validateSlackMessageText } from 'src/utils/slack-text';

export const slackUpdateMessageHandler = async (
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
