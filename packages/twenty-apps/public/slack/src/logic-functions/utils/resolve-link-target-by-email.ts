import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import {
  type ResolvedSlackUser,
  resolveSlackUserByEmail,
} from 'src/logic-functions/utils/resolve-slack-user-by-email';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

type EmailLinkTarget =
  | {
      success: true;
      slackUserId: string;
      slackTeamId: string | undefined;
      displayName: string | undefined;
    }
  | { success: false; message: string; error: string };

export const resolveLinkTargetByEmail = async ({
  slackClient,
  email,
  requestedSlackTeamId,
}: {
  slackClient: WebClient;
  email: string;
  requestedSlackTeamId: string | undefined;
}): Promise<EmailLinkTarget> => {
  let resolvedUser: ResolvedSlackUser | undefined;

  try {
    resolvedUser = await resolveSlackUserByEmail(slackClient, email);
  } catch (error) {
    return {
      success: false,
      message: 'Could not look up that Slack email',
      error: toErrorMessage(error),
    };
  }

  if (!isDefined(resolvedUser)) {
    return {
      success: false,
      message: 'No Slack user with that email',
      error:
        'No Slack user with that email in the installed workspace. For a guest or Slack Connect user from another workspace, enter their Slack user id instead.',
    };
  }

  if (
    isNonEmptyString(requestedSlackTeamId) &&
    isNonEmptyString(resolvedUser.slackTeamId) &&
    resolvedUser.slackTeamId !== requestedSlackTeamId
  ) {
    return {
      success: false,
      message: 'Slack team id does not match the user',
      error: `That Slack user belongs to workspace ${resolvedUser.slackTeamId}, not ${requestedSlackTeamId}. Check the team id and try again.`,
    };
  }

  return {
    success: true,
    slackUserId: resolvedUser.slackUserId,
    slackTeamId: requestedSlackTeamId ?? resolvedUser.slackTeamId,
    displayName: resolvedUser.displayName,
  };
};
