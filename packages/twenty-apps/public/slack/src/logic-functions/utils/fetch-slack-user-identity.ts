import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { resolveSlackInstalledTeamId } from 'src/logic-functions/utils/resolve-slack-installed-team-id';

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

  if (user === undefined) {
    return undefined;
  }

  const displayName = user.profile?.display_name;
  const realName = user.real_name;
  const email = user.profile?.email;

  const installedTeamId = await resolveSlackInstalledTeamId(client);

  const canBeMatchedOnEmail =
    isNonEmptyString(email) &&
    isNonEmptyString(installedTeamId) &&
    user.team_id === installedTeamId &&
    user.id !== SLACKBOT_USER_ID &&
    user.is_bot !== true &&
    user.deleted !== true &&
    user.is_restricted !== true &&
    user.is_ultra_restricted !== true &&
    user.is_email_confirmed !== false;

  return {
    slackUserId,
    slackTeamId: isNonEmptyString(user.team_id) ? user.team_id : undefined,
    displayName: isNonEmptyString(displayName)
      ? displayName
      : isNonEmptyString(realName)
        ? realName
        : undefined,
    email: isNonEmptyString(email) ? email : undefined,
    canBeMatchedOnEmail,
  };
};
