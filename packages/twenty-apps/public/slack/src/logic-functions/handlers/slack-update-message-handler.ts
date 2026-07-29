import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { type SlackUpdateMessageInput } from 'src/logic-functions/types/slack-update-message-input.type';
import { getSlackChatMessageBodyFields } from 'src/logic-functions/utils/get-slack-chat-message-body-fields';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { isSlackMarkdownFormatError } from 'src/logic-functions/utils/is-slack-markdown-format-error';
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

  const updateWithFormat = async (
    messageFormat: SlackUpdateMessageInput['messageFormat'],
  ): Promise<SlackToolResult> => {
    const bodyFields = getSlackChatMessageBodyFields(
      parameters.newMessageText,
      messageFormat,
    );

    const data = await client.chat.update({
      channel: parameters.slackChannelId,
      ts: parameters.messageTimestamp,
      ...bodyFields,
    });

    return {
      success: true,
      message: 'Slack message updated.',
      slackTs: data.ts,
      channel: parameters.slackChannelId,
    };
  };

  try {
    return await updateWithFormat(parameters.messageFormat);
  } catch (error) {
    if (
      parameters.messageFormat !== 'markdown' ||
      !isSlackMarkdownFormatError(error)
    ) {
      return slackToolFailure('Failed to update Slack message', error);
    }
  }

  try {
    return await updateWithFormat('plain');
  } catch (error) {
    return slackToolFailure('Failed to update Slack message', error);
  }
};
