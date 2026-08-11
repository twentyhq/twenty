import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';

const SLACKBOT_USER_ID = 'USLACKBOT';

export const fetchSlackUserIdentity = async ({
  client,
  slackUserId,
}: {
  client: WebClient;
  slackUserId: string | undefined;
}): Promise<SlackUserIdentity | undefined> => {
  if (!isNonEmptyString(slackUserId)) {
    return undefined;
  }

  const userInfo = await client.users
    .info({ user: slackUserId })
    .catch(() => undefined);

  const user = userInfo?.user;

  if (!isDefined(user)) {
    return undefined;
  }

  const displayName = user.profile?.display_name;
  const realName = user.real_name;
  const email = user.profile?.email;

  return {
    slackUserId,
    slackTeamId: isNonEmptyString(user.team_id) ? user.team_id : undefined,
    displayName: isNonEmptyString(displayName)
      ? displayName
      : isNonEmptyString(realName)
        ? realName
        : undefined,
    email: isNonEmptyString(email) ? email : undefined,
    // Bots, deactivated accounts and Slack guests are never auto-linked, whose
    // team they belong to notwithstanding.
    isRegularUserAccount:
      user.id !== SLACKBOT_USER_ID &&
      user.is_bot !== true &&
      user.deleted !== true &&
      user.is_restricted !== true &&
      user.is_ultra_restricted !== true &&
      user.is_email_confirmed !== false,
  };
};
