// Slack channel ids are unique across teams, so the pair identifies the thread
// however many Slack teams a workspace connects
export const buildSlackAssistantThreadKey = ({
  channelId,
  threadTimestamp,
}: {
  channelId: string;
  threadTimestamp: string;
}): string => `${channelId}:${threadTimestamp}`;
