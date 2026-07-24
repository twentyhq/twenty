import { isNonEmptyString } from '@sniptt/guards';

// Channel answers are threaded under the triggering message; direct messages are
// answered at the top level unless the request already came from a thread.
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
