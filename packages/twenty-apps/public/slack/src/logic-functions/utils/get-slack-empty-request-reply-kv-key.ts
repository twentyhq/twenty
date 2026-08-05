export const getSlackEmptyRequestReplyKvKey = ({
  slackChannelId,
  slackMessageTimestamp,
}: {
  slackChannelId: string;
  slackMessageTimestamp: string;
}): string =>
  `slack-empty-request-reply:${slackChannelId}:${slackMessageTimestamp}`;
