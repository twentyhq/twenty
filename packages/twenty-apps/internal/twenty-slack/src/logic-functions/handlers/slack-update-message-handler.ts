import { WebClient } from '@slack/web-api';

import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { type SlackUpdateMessageInput } from 'src/logic-functions/types/slack-update-message-input.type';
import { getSlackChatMessageBodyFields } from 'src/logic-functions/utils/get-slack-chat-message-body-fields';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { slackToolFailure } from 'src/logic-functions/utils/slack-tool-failure';

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

  const client = new WebClient(connectionResult.accessToken);

  try {
    const bodyFields = getSlackChatMessageBodyFields(
      parameters.newMessageText,
      parameters.messageFormat,
    );

    const updatePayload = {
      channel: parameters.slackChannelId,
      ts: parameters.messageTimestamp,
      ...bodyFields,
    };

    const data = await client.chat.update(updatePayload);

    return {
      success: true,
      message: 'Slack message updated.',
      slackTs: data.ts,
      channel: parameters.slackChannelId,
    };
  } catch (error) {
    return slackToolFailure('Failed to update Slack message', error);
  }
};
