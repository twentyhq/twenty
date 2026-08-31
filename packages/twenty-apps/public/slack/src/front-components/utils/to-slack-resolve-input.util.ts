import { isNonEmptyString } from '@sniptt/guards';

export type SlackResolveInput = {
  email: string | undefined;
  slackUserId: string | undefined;
  slackTeamId: string | undefined;
};

export const toSlackResolveInput = ({
  email,
  slackUserId,
  slackTeamId,
}: {
  email: string;
  slackUserId: string;
  slackTeamId: string;
}): SlackResolveInput => {
  const trimmedEmail = email.trim();
  const trimmedSlackUserId = slackUserId.trim();
  const trimmedSlackTeamId = slackTeamId.trim();

  return {
    email: isNonEmptyString(trimmedEmail) ? trimmedEmail : undefined,
    slackUserId: isNonEmptyString(trimmedSlackUserId)
      ? trimmedSlackUserId
      : undefined,
    slackTeamId: isNonEmptyString(trimmedSlackTeamId)
      ? trimmedSlackTeamId
      : undefined,
  };
};
