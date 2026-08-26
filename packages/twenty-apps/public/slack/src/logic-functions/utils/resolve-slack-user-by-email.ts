import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

export type ResolvedSlackUser = {
  slackUserId: string;
  slackTeamId: string | undefined;
  displayName: string | undefined;
};

// users.lookupByEmail only sees the installed workspace, so guests and Slack
// Connect users from another workspace resolve to undefined and must be linked
// by their Slack user id instead.
export const resolveSlackUserByEmail = async (
  slackClient: WebClient,
  email: string,
): Promise<ResolvedSlackUser | undefined> => {
  const result = await slackClient.users
    .lookupByEmail({ email })
    .catch(() => undefined);

  const user = result?.user;

  if (!isNonEmptyString(user?.id)) {
    return undefined;
  }

  return {
    slackUserId: user.id,
    slackTeamId: isNonEmptyString(user.team_id) ? user.team_id : undefined,
    displayName: isNonEmptyString(user.real_name) ? user.real_name : undefined,
  };
};
