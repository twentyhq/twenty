export const getSlackThreadKvKey = ({
  channelId,
  threadTimestamp,
}: {
  channelId: string;
  threadTimestamp: string;
}): string => `slack-thread:${channelId}:${threadTimestamp}`;
