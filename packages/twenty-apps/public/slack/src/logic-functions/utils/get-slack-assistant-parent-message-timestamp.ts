import { isNonEmptyString } from '@sniptt/guards';

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
