import { isNonEmptyString } from '@sniptt/guards';

// Under agent_view every conversation is a thread, DMs included: replies
// always target the incoming message's thread, or start one on the message
export const getSlackAssistantParentMessageTimestamp = ({
  slackThreadTimestamp,
  slackMessageTimestamp,
}: {
  slackThreadTimestamp: string | undefined;
  slackMessageTimestamp: string;
}): string =>
  isNonEmptyString(slackThreadTimestamp)
    ? slackThreadTimestamp
    : slackMessageTimestamp;
