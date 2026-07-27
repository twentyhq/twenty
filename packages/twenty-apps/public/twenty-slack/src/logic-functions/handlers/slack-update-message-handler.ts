import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { type SlackUpdateMessageInput } from 'src/logic-functions/types/slack-update-message-input.type';
import { getSlackChatMessageBodyFields } from 'src/logic-functions/utils/get-slack-chat-message-body-fields';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { isSlackMarkdownFormatError } from 'src/logic-functions/utils/is-slack-markdown-format-error.util';
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

  const attemptUpdate = async (
    messageFormat: SlackUpdateMessageInput['messageFormat'],
  ): Promise<
    | { success: true; result: SlackToolResult }
    | { success: false; error: unknown }
  > => {
    try {
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
        result: {
          success: true,
          message: 'Slack message updated.',
          slackTs: data.ts,
          channel: parameters.slackChannelId,
        },
      };
    } catch (error) {
      return { success: false, error };
    }
  };

  const primaryAttempt = await attemptUpdate(parameters.messageFormat);

  if (primaryAttempt.success) {
    return primaryAttempt.result;
  }

  if (
    parameters.messageFormat === 'markdown' &&
    isSlackMarkdownFormatError(primaryAttempt.error)
  ) {
    const plainAttempt = await attemptUpdate('plain');

    if (plainAttempt.success) {
      return plainAttempt.result;
    }

    return slackToolFailure(
      'Failed to update Slack message',
      plainAttempt.error,
    );
  }

  return slackToolFailure(
    'Failed to update Slack message',
    primaryAttempt.error,
  );
};
