import { isNonEmptyString } from '@sniptt/guards';

export type SlackResolveInput = {
  slackUserId: string | undefined;
  slackTeamId: string | undefined;
};

export const toSlackResolveInput = ({
  slackUserId,
  slackTeamId,
}: {
  slackUserId: string;
  slackTeamId: string;
}): SlackResolveInput => {
  const trimmedSlackUserId = slackUserId.trim();
  const trimmedSlackTeamId = slackTeamId.trim();

  return {
    slackUserId: isNonEmptyString(trimmedSlackUserId)
      ? trimmedSlackUserId
      : undefined,
    slackTeamId: isNonEmptyString(trimmedSlackTeamId)
      ? trimmedSlackTeamId
      : undefined,
  };
};
