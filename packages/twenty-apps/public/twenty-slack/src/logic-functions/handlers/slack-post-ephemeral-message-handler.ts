import { type SlackPostEphemeralMessageInput } from 'src/logic-functions/types/slack-post-ephemeral-message-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { getSlackChatMessageBodyFields } from 'src/logic-functions/utils/get-slack-chat-message-body-fields';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { slackToolFailure } from 'src/logic-functions/utils/slack-tool-failure';

export const slackPostEphemeralMessageHandler = async (
  parameters: SlackPostEphemeralMessageInput,
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
      parameters.messageText,
      parameters.messageFormat,
    );

    const postEphemeralPayload = {
      channel: parameters.slackChannelId,
      user: parameters.recipientSlackUserId,
      ...bodyFields,
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
