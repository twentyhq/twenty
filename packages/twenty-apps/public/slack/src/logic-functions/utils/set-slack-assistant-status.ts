import { type WebClient } from '@slack/web-api';

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
}): Promise<void> => {
  try {
    await client.assistant.threads.setStatus({
      channel_id: slackChannelId,
      thread_ts: threadTimestamp,
      status,
    });
  } catch (error) {
    console.warn(
      `[slack] assistant.threads.setStatus failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
