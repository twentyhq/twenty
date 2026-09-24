import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackResolveUserLinkResult } from 'src/logic-functions/types/slack-resolved-user.type';
import { type SlackRouteBody } from 'src/logic-functions/types/slack-route-body.type';
import { currentUserHasRolesPermission } from 'src/logic-functions/utils/current-user-has-roles-permission';
import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { resolveLinkTargetById } from 'src/logic-functions/utils/resolve-link-target-by-id';
import {
  type ResolvedSlackUser,
  resolveSlackUserByEmail,
} from 'src/logic-functions/utils/resolve-slack-user-by-email';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const readBody = (
  payload: SlackRouteBody,
): { email?: string; slackUserId?: string; slackTeamId?: string } => {
  const body = asRecord(payload.body) ?? {};

  return {
    email: readOptionalString(body.email),
    slackUserId: readOptionalString(body.slackUserId),
    slackTeamId: readOptionalString(body.slackTeamId),
  };
};

export const slackResolveUserLinkHandler = async (
  payload: SlackRouteBody,
): Promise<SlackResolveUserLinkResult> => {
  const {
    email,
    slackUserId: requestedSlackUserId,
    slackTeamId,
  } = readBody(payload);

  if (!isNonEmptyString(email) && !isNonEmptyString(requestedSlackUserId)) {
    return {
      success: false,
      message: 'Nothing to resolve',
      error: 'Provide a Slack email or a Slack user id.',
    };
  }

  const isAllowed = await currentUserHasRolesPermission();

  if (!isAllowed) {
    return {
      success: false,
      message: 'Not allowed',
      error: 'Only members with the roles permission can resolve Slack users.',
    };
  }

  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return {
      success: false,
      message: 'Slack is not connected',
      error: slackClientResult.error,
    };
  }

  const slackClient = slackClientResult.client;
  const installedTeamId = await getInstalledSlackTeamId(slackClient);

  if (!isNonEmptyString(installedTeamId)) {
    return {
      success: false,
      message: 'Could not verify the installed Slack workspace',
      error: 'Slack did not confirm the installed workspace. Please try again.',
    };
  }

  if (isNonEmptyString(requestedSlackUserId)) {
    const idTarget = await resolveLinkTargetById({
      slackClient,
      slackUserId: requestedSlackUserId,
      requestedSlackTeamId: slackTeamId,
      installedSlackTeamId: installedTeamId,
    });

    if (!idTarget.success) {
      return idTarget;
    }

    return {
      success: true,
      slackUser: {
        slackUserId: requestedSlackUserId,
        slackTeamId: idTarget.slackTeamId,
        displayName: idTarget.identity?.displayName,
        email: idTarget.identity?.isRegularUserAccount
          ? idTarget.identity.email
          : undefined,
        isInInstalledWorkspace: idTarget.slackTeamId === installedTeamId,
      },
    };
  }

  let resolvedUser: ResolvedSlackUser | undefined;

  try {
    resolvedUser = await resolveSlackUserByEmail(slackClient, email ?? '');
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
        'No Slack user with that email in the installed workspace. For a guest or Slack Connect user from another workspace, use their Slack user id instead.',
    };
  }

  const resolvedTeamId = resolvedUser.slackTeamId ?? installedTeamId;

  return {
    success: true,
    slackUser: {
      slackUserId: resolvedUser.slackUserId,
      slackTeamId: resolvedTeamId,
      displayName: resolvedUser.displayName,
      email: resolvedUser.isRegularUserAccount ? email : undefined,
      isInInstalledWorkspace: resolvedTeamId === installedTeamId,
    },
  };
};
