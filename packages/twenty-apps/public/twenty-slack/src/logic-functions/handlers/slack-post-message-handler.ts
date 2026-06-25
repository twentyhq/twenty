import { type SlackPostMessageInput } from 'src/logic-functions/types/slack-post-message-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { getSlackChatMessageBodyFields } from 'src/logic-functions/utils/get-slack-chat-message-body-fields';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { slackToolFailure } from 'src/logic-functions/utils/slack-tool-failure';

export const slackPostMessageHandler = async (
  parameters: SlackPostMessageInput,
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

  const parentTimestamp = parameters.parentMessageTimestamp;

  try {
    const bodyFields = getSlackChatMessageBodyFields(
      parameters.messageText,
      parameters.messageFormat,
    );

    const data = await client.chat.postMessage({
      channel: parameters.slackChannelId,
      thread_ts:
        parentTimestamp != null && parentTimestamp.trim().length > 0
          ? parentTimestamp.trim()
          : undefined,
      ...bodyFields,
    });

    return {
      success: true,
      message: data.ts
        ? `Message posted to Slack (ts=${data.ts}).`
        : 'Message posted to Slack.',
      slackTs: data.ts,
      channel: data.channel,
    };
  } catch (error) {
    return slackToolFailure('Failed to post Slack message', error);
  }
};
