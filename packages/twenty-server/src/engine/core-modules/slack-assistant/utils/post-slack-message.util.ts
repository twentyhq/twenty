import { type SlackApiResponse } from 'src/engine/core-modules/slack-assistant/types/slack-api-response.type';
import { callSlackApi } from 'src/engine/core-modules/slack-assistant/utils/call-slack-api.util';

type SlackChatPostMessageResponse = SlackApiResponse & { ts?: string };

export const postSlackMessage = async ({
  token,
  channel,
  threadTs,
  markdownText,
}: {
  token: string;
  channel: string;
  threadTs?: string;
  markdownText: string;
}): Promise<string> => {
  const response = await callSlackApi<SlackChatPostMessageResponse>(
    'chat.postMessage',
    {
      channel,
      thread_ts: threadTs,
      markdown_text: markdownText,
    },
    token,
  );

  if (response.ok !== true || typeof response.ts !== 'string') {
    throw new Error(
      `Slack chat.postMessage failed: ${response.error ?? 'unknown_error'}`,
    );
  }

  return response.ts;
};
