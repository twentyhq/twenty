import { type WebClient } from '@slack/web-api';

// Asked of Slack, not read from the request record: that record is writable by
// hand, and a forged "im" would earn run-as for any message the member posted
export const isSlackDirectMessageChannel = async ({
  client,
  slackChannelId,
}: {
  client: WebClient;
  slackChannelId: string;
}): Promise<boolean> => {
  const channelInfo = await client.conversations
    .info({ channel: slackChannelId })
    .catch(() => undefined);

  return channelInfo?.channel?.is_im === true;
};
