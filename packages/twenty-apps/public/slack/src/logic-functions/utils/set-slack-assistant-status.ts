import { runBestEffortSlackCall } from 'src/logic-functions/utils/run-best-effort-slack-call';

export const setSlackAssistantStatus = async ({
  slackChannelId,
  threadTimestamp,
  status,
}: {
  slackChannelId: string;
  threadTimestamp: string;
  status: string;
}): Promise<void> =>
  runBestEffortSlackCall('assistant.threads.setStatus', (client) =>
    client.assistant.threads.setStatus({
      channel_id: slackChannelId,
      thread_ts: threadTimestamp,
      status,
    }),
  );
