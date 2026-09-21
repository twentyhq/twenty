import { type SlackMessageReference } from 'src/logic-functions/types/slack-message-reference.type';

export const getSlackEmptyRequestReplyKvKey = ({
  slackChannelId,
  slackMessageTimestamp,
}: SlackMessageReference): string =>
  `slack-empty-request-reply:${slackChannelId}:${slackMessageTimestamp}`;
