import { callSlackApi } from 'src/engine/core-modules/slack-assistant/utils/call-slack-api.util';

export const updateSlackMessage = async ({
  token,
  channel,
  ts,
  markdownText,
}: {
  token: string;
  channel: string;
  ts: string;
  markdownText: string;
}): Promise<void> => {
  const response = await callSlackApi(
    'chat.update',
    {
      channel,
      ts,
      markdown_text: markdownText,
    },
    token,
  );

  if (response.ok !== true) {
    throw new Error(
      `Slack chat.update failed: ${response.error ?? 'unknown_error'}`,
    );
  }
};
