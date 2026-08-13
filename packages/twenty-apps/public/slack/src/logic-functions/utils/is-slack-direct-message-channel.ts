import { type WebClient } from '@slack/web-api';

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
