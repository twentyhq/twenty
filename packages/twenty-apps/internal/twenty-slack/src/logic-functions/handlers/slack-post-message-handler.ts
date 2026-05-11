import { WebClient } from '@slack/web-api';
import { isDefined } from 'twenty-shared/utils';

import { type SlackPostMessageInput } from 'src/logic-functions/types/slack-post-message-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { slackToolFailure } from 'src/logic-functions/utils/slack-tool-failure';

export const slackPostMessageHandler = async (
  parameters: SlackPostMessageInput,
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

  const parentTimestamp = parameters.parentMessageTimestamp;

  try {
    const data = await client.chat.postMessage({
      channel: parameters.slackChannelId,
      text: parameters.messageText,
      thread_ts:
        isDefined(parentTimestamp) && parentTimestamp.trim().length > 0
          ? parentTimestamp.trim()
          : undefined,
      ...(isDefined(parameters.useSlackMarkdown)
        ? { mrkdwn: parameters.useSlackMarkdown }
        : {}),
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
