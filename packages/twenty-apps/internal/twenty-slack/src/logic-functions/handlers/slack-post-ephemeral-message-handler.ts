import { WebClient } from '@slack/web-api';
import { isDefined } from 'twenty-shared/utils';

import { type SlackPostEphemeralMessageInput } from 'src/logic-functions/types/slack-post-ephemeral-message-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { slackToolFailure } from 'src/logic-functions/utils/slack-tool-failure';

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

  const client = new WebClient(connectionResult.accessToken);

  try {
    const postEphemeralPayload = {
      channel: parameters.slackChannelId,
      user: parameters.recipientSlackUserId,
      text: parameters.messageText,
      ...(isDefined(parameters.useSlackMarkdown)
        ? { mrkdwn: parameters.useSlackMarkdown }
        : {}),
    };

    await client.chat.postEphemeral(postEphemeralPayload);

    return {
      success: true,
      message: 'Ephemeral message sent to the user in the channel.',
      channel: parameters.slackChannelId,
    };
  } catch (error) {
    return slackToolFailure('Failed to post Slack ephemeral message', error);
  }
};
