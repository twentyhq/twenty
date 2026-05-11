import { isDefined } from 'twenty-shared/utils';

import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { type SlackUpdateMessageInput } from 'src/logic-functions/types/slack-update-message-input.type';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { slackToolFailure } from 'src/logic-functions/utils/slack-tool-failure';
import { createSlackWebClient } from 'src/utils/create-slack-web-client';

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

  const client = createSlackWebClient(connectionResult.accessToken);

  try {
    const updatePayload = {
      channel: parameters.slack_channel_id,
      ts: parameters.message_timestamp,
      text: parameters.new_message_text,
      ...(isDefined(parameters.use_slack_markdown)
        ? { mrkdwn: parameters.use_slack_markdown }
        : {}),
    };

    const data = await client.chat.update(updatePayload);

    return {
      success: true,
      message: 'Slack message updated.',
      slackTs: data.ts,
      channel: parameters.slack_channel_id,
    };
  } catch (error) {
    return slackToolFailure('Failed to update Slack message', error);
  }
};
