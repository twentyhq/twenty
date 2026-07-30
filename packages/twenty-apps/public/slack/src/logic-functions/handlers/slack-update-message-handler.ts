import { isNonEmptyArray } from '@sniptt/guards';

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

  const updateWithBody = async (
    body: Pick<SlackUpdateMessageInput, 'messageFormat' | 'messageBlocks'>,
  ): Promise<SlackToolResult> => {
    const bodyFields = getSlackChatMessageBodyFields({
      messageText: parameters.newMessageText,
      messageFormat: body.messageFormat,
      messageBlocks: body.messageBlocks,
    });

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

  const isRichBody =
    isNonEmptyArray(parameters.messageBlocks) ||
    parameters.messageFormat === 'markdown';

  try {
    return await updateWithBody(parameters);
  } catch (error) {
    if (!isRichBody || !isSlackMarkdownFormatError(error)) {
      return slackToolFailure('Failed to update Slack message', error);
    }
  }

  try {
    return await updateWithBody({ messageFormat: 'plain' });
  } catch (error) {
    return slackToolFailure('Failed to update Slack message', error);
  }
};
