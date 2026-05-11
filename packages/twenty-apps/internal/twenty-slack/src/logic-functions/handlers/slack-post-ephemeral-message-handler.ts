import { isDefined } from 'twenty-shared/utils';

import { type SlackPostEphemeralMessageInput } from 'src/logic-functions/types/slack-post-ephemeral-message-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { slackToolFailure } from 'src/logic-functions/utils/slack-tool-failure';
import { createSlackWebClient } from 'src/utils/create-slack-web-client';

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

  const client = createSlackWebClient(connectionResult.accessToken);

  try {
    const postEphemeralPayload = {
      channel: parameters.slack_channel_id,
      user: parameters.recipient_slack_user_id,
      text: parameters.message_text,
      ...(isDefined(parameters.use_slack_markdown)
        ? { mrkdwn: parameters.use_slack_markdown }
        : {}),
    };

    await client.chat.postEphemeral(postEphemeralPayload);

    return {
      success: true,
      message: 'Ephemeral message sent to the user in the channel.',
      channel: parameters.slack_channel_id,
    };
  } catch (error) {
    return slackToolFailure('Failed to post Slack ephemeral message', error);
  }
};
