import { isNonEmptyString } from '@sniptt/guards';

export const getSlackAssistantParentMessageTimestamp = ({
  slackThreadTimestamp,
  slackMessageTimestamp,
  isDirectMessage,
}: {
  slackThreadTimestamp: string | undefined;
  slackMessageTimestamp: string;
  isDirectMessage: boolean;
}): string | undefined => {
  if (isNonEmptyString(slackThreadTimestamp)) {
    return slackThreadTimestamp;
  }

  return isDirectMessage ? undefined : slackMessageTimestamp;
};
