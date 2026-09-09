import { type WebClient } from '@slack/web-api';

import { runBestEffortSlackCallWithClient } from 'src/logic-functions/utils/run-best-effort-slack-call-with-client';

export const setSlackAssistantStatus = async ({
  client,
  slackChannelId,
  threadTimestamp,
  status,
}: {
  client: WebClient;
  slackChannelId: string;
  threadTimestamp: string;
  status: string;
}): Promise<void> =>
  runBestEffortSlackCallWithClient('assistant.threads.setStatus', client, () =>
    client.assistant.threads.setStatus({
      channel_id: slackChannelId,
      thread_ts: threadTimestamp,
      status,
    }),
  );
