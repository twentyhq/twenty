import { isNonEmptyString } from '@sniptt/guards';
import { type RoutePayload } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackResolveUserLinkResult } from 'src/logic-functions/types/slack-resolved-user.type';
import { currentUserHasWorkspaceMembersPermission } from 'src/logic-functions/utils/current-user-has-workspace-members-permission';
import { fetchSlackUserIdentity } from 'src/logic-functions/utils/fetch-slack-user-identity';
import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { resolveSlackUserByEmail } from 'src/logic-functions/utils/resolve-slack-user-by-email';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';

type SlackRouteBody = Pick<RoutePayload<unknown>, 'body'>;

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
  const { email, slackUserId: requestedSlackUserId, slackTeamId } =
    readBody(payload);

  if (!isNonEmptyString(email) && !isNonEmptyString(requestedSlackUserId)) {
    return {
      success: false,
      message: 'Nothing to resolve',
      error: 'Provide a Slack email or a Slack user id.',
    };
  }

  const isAllowed = await currentUserHasWorkspaceMembersPermission();

  if (!isAllowed) {
    return {
      success: false,
      message: 'Not allowed',
      error:
        'Only members with the workspace members permission can resolve Slack users.',
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

  if (isNonEmptyString(requestedSlackUserId)) {
    const identity = await fetchSlackUserIdentity({
      client: slackClient,
      slackUserId: requestedSlackUserId,
    });

    const resolvedTeamId =
      slackTeamId ?? identity?.slackTeamId ?? installedTeamId;

    if (!isNonEmptyString(resolvedTeamId)) {
      return {
        success: false,
        message: 'Could not resolve the Slack workspace',
        error: 'Provide the Slack team id for this user.',
      };
    }

    return {
      success: true,
      slackUser: {
        slackUserId: requestedSlackUserId,
        slackTeamId: resolvedTeamId,
        displayName: identity?.displayName,
        isInInstalledWorkspace:
          isNonEmptyString(installedTeamId) &&
          resolvedTeamId === installedTeamId,
      },
    };
  }

  let resolvedUser;

  try {
    resolvedUser = await resolveSlackUserByEmail(slackClient, email ?? '');
  } catch (error) {
    return {
      success: false,
      message: 'Could not look up that Slack email',
      error: error instanceof Error ? error.message : String(error),
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
      slackTeamId: resolvedTeamId ?? '',
      displayName: resolvedUser.displayName,
      isInInstalledWorkspace:
        isNonEmptyString(installedTeamId) && resolvedTeamId === installedTeamId,
    },
  };
};
