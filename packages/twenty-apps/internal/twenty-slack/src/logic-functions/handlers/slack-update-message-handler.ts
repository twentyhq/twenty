import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { type SlackUpdateMessageInput } from 'src/logic-functions/types/slack-update-message-input.type';
import { getSlackChatMessageBodyFields } from 'src/logic-functions/utils/get-slack-chat-message-body-fields';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { slackToolFailure } from 'src/logic-functions/utils/slack-tool-failure';

export const slackUpdateMessageHandler = async (
  parameters: SlackUpdateMessageInput,
): Promise<SlackToolResult> => {
  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return {
      success: false,
      message: 'Slack is not connected',
      error: slackClientResult.error,
    };
  }

  const { client } = slackClientResult;

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
