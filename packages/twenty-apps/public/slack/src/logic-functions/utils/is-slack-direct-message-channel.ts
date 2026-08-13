import { type WebClient } from '@slack/web-api';

// Asked of Slack rather than read from the request record, which is writable by
// hand: a forged "im" would otherwise replay any message the member ever posted
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
