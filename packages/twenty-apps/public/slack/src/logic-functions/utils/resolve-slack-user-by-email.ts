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

// users.lookupByEmail only sees the installed workspace, so guests and Slack
// Connect users from another workspace resolve to undefined and must be linked
// by their Slack user id instead.
export const resolveSlackUserByEmail = async (
  slackClient: WebClient,
  email: string,
): Promise<ResolvedSlackUser | undefined> => {
  let result;

  try {
    result = await slackClient.users.lookupByEmail({ email });
  } catch (error) {
    // A missing email is an expected "not linkable here" outcome; any other
    // error (auth, rate limit, network) is a real failure the caller must not
    // read as "no such user".
    if (getSlackApiErrorCode(error) === USERS_NOT_FOUND_ERROR_CODE) {
      return undefined;
    }

    throw error;
  }

  const user = result.user;

  if (!isNonEmptyString(user?.id)) {
    return undefined;
  }

  // Guests may be linked manually, but a bot, a deactivated account, or an
  // unconfirmed profile email must not resolve: anyone can type another
  // person's address into their profile, and only Slack's confirmation ties
  // the mailbox owner to this account.
  if (user.is_bot || user.deleted || !user.is_email_confirmed) {
    return undefined;
  }

  return {
    slackUserId: user.id,
    slackTeamId: isNonEmptyString(user.team_id) ? user.team_id : undefined,
    displayName: [user.profile?.display_name, user.real_name].find(
      isNonEmptyString,
    ),
    // Guests resolve for manual linking, but only a regular account's email
    // certifies its owner: consumers key instant activation on it, and the
    // write decision refuses the match for restricted accounts.
    isRegularUserAccount: !user.is_restricted && !user.is_ultra_restricted,
  };
};
