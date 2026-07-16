import { callSlackApi } from 'src/engine/core-modules/slack-assistant/utils/call-slack-api.util';

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
}): Promise<void> => {
  const response = await callSlackApi(
    'chat.postMessage',
    {
      channel,
      thread_ts: threadTs,
      markdown_text: markdownText,
    },
    token,
  );

  if (response.ok !== true) {
    throw new Error(
      `Slack chat.postMessage failed: ${response.error ?? 'unknown_error'}`,
    );
  }
};
