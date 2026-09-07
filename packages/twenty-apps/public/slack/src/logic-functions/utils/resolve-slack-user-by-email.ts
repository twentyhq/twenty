import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

import { getSlackApiErrorCode } from 'src/logic-functions/utils/get-slack-api-error-code';

export type ResolvedSlackUser = {
  slackUserId: string;
  slackTeamId: string | undefined;
  displayName: string | undefined;
  isRegularUserAccount: boolean;
};

const USERS_NOT_FOUND_ERROR_CODE = 'users_not_found';

export const resolveSlackUserByEmail = async (
  slackClient: WebClient,
  email: string,
): Promise<ResolvedSlackUser | undefined> => {
  let result;

  try {
    result = await slackClient.users.lookupByEmail({ email });
  } catch (error) {
    if (getSlackApiErrorCode(error) === USERS_NOT_FOUND_ERROR_CODE) {
      return undefined;
    }

    throw error;
  }

  const user = result.user;

  if (!isNonEmptyString(user?.id)) {
    return undefined;
  }

  if (user.is_bot || user.deleted || !user.is_email_confirmed) {
    return undefined;
  }

  return {
    slackUserId: user.id,
    slackTeamId: isNonEmptyString(user.team_id) ? user.team_id : undefined,
    displayName: [user.profile?.display_name, user.real_name].find(
      isNonEmptyString,
    ),
    isRegularUserAccount: !user.is_restricted && !user.is_ultra_restricted,
  };
};
