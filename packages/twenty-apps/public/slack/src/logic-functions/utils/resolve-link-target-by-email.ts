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
  installedSlackTeamId,
}: {
  slackClient: WebClient;
  email: string;
  requestedSlackTeamId: string | undefined;
  installedSlackTeamId: string;
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

  // Slack resolved the account but would not say which workspace it is in, so a
  // team id other than the installed one is a claim nothing can corroborate -
  // and claiming another workspace is what skips the consent request.
  if (
    isNonEmptyString(requestedSlackTeamId) &&
    !isNonEmptyString(resolvedUser.slackTeamId) &&
    requestedSlackTeamId !== installedSlackTeamId
  ) {
    return {
      success: false,
      message: 'Could not verify the Slack workspace for that user',
      error:
        'Slack did not confirm which workspace this user belongs to, so that team id cannot be accepted. Leave the team id blank to use the installed workspace.',
    };
  }

  return {
    success: true,
    slackUserId: resolvedUser.slackUserId,
    slackTeamId: resolvedUser.slackTeamId ?? requestedSlackTeamId,
    displayName: resolvedUser.displayName,
  };
};
