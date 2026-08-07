import { runBestEffortSlackCall } from 'src/logic-functions/utils/run-best-effort-slack-call';

export const setSlackAssistantThreadTitle = async ({
  slackChannelId,
  threadTimestamp,
  title,
}: {
  slackChannelId: string;
  threadTimestamp: string;
  title: string;
}): Promise<void> =>
  runBestEffortSlackCall((client) =>
    client.assistant.threads.setTitle({
      channel_id: slackChannelId,
      thread_ts: threadTimestamp,
      title,
    }),
  );
