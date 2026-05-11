import { WebClient } from '@slack/web-api';

import { type SlackDeleteMessageInput } from 'src/logic-functions/types/slack-delete-message-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { slackToolFailure } from 'src/logic-functions/utils/slack-tool-failure';

export const slackDeleteMessageHandler = async (
  parameters: SlackDeleteMessageInput,
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
    await client.chat.delete({
      channel: parameters.slackChannelId,
      ts: parameters.messageTimestamp,
    });

    return {
      success: true,
      message: 'Slack message deleted.',
      slackTs: parameters.messageTimestamp,
      channel: parameters.slackChannelId,
    };
  } catch (error) {
    return slackToolFailure('Failed to delete Slack message', error);
  }
};
