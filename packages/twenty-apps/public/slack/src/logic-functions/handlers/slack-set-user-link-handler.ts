import { isNonEmptyString, isObject } from '@sniptt/guards';
import { type RoutePayload } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { createSlackUserLink } from 'src/logic-functions/data/create-slack-user-link';
import { findSlackUserLink } from 'src/logic-functions/data/find-slack-user-link';
import { updateSlackUserLink } from 'src/logic-functions/data/update-slack-user-link';
import { type SlackSetUserLinkInput } from 'src/logic-functions/types/slack-set-user-link-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { type SlackUserLink } from 'src/logic-functions/types/slack-user-link.type';
import { currentUserHasWorkspaceMembersPermission } from 'src/logic-functions/utils/current-user-has-workspace-members-permission';
import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { resolveSlackUserByEmail } from 'src/logic-functions/utils/resolve-slack-user-by-email';

// The agent tool passes the input directly, the HTTP route wraps it in a RoutePayload body.
type SlackSetUserLinkPayload =
  | SlackSetUserLinkInput
  | RoutePayload<SlackSetUserLinkInput>;

const isRoutePayload = (
  payload: SlackSetUserLinkPayload,
): payload is RoutePayload<SlackSetUserLinkInput> => 'body' in payload;

const readOptionalString = (value: unknown): string | undefined =>
  isNonEmptyString(value) ? value : undefined;

// The HTTP route body is untrusted, so read each field rather than trusting its declared type.
const toSlackSetUserLinkInput = (source: unknown): SlackSetUserLinkInput => {
  const body: Record<string, unknown> = isObject<
    Record<string, unknown>,
    unknown
  >(source)
    ? source
    : {};

  return {
    workspaceMemberId: readOptionalString(body.workspaceMemberId) ?? '',
    slackUserId: readOptionalString(body.slackUserId),
    email: readOptionalString(body.email),
    slackTeamId: readOptionalString(body.slackTeamId),
    name: readOptionalString(body.name),
  };
};

const extractSlackSetUserLinkInput = (
  payload: SlackSetUserLinkPayload,
): SlackSetUserLinkInput =>
  toSlackSetUserLinkInput(isRoutePayload(payload) ? payload.body : payload);

export const slackSetUserLinkHandler = async (
  payload: SlackSetUserLinkPayload,
): Promise<SlackToolResult> => {
  const {
    slackUserId: requestedSlackUserId,
    email,
    workspaceMemberId,
    slackTeamId: requestedSlackTeamId,
    name,
  } = extractSlackSetUserLinkInput(payload);

  if (!isNonEmptyString(workspaceMemberId)) {
    return {
      success: false,
      message: 'Missing required fields',
      error: 'workspaceMemberId is required.',
    };
  }

  if (!isNonEmptyString(requestedSlackUserId) && !isNonEmptyString(email)) {
    return {
      success: false,
      message: 'Missing required fields',
      error: 'Provide a Slack email or a Slack user id.',
    };
  }

  const isAllowed = await currentUserHasWorkspaceMembersPermission();

  if (!isAllowed) {
    return {
      success: false,
      message: 'Not allowed',
      error:
        'Only members with the workspace members permission can set Slack user links.',
    };
  }

  let slackUserId = requestedSlackUserId;
  let slackTeamId = requestedSlackTeamId;
  let resolvedName = name;

  const needsSlackClient =
    !isNonEmptyString(slackUserId) || !isNonEmptyString(slackTeamId);

  if (needsSlackClient) {
    const slackClientResult = await getSlackClient();

    if (!slackClientResult.success) {
      return {
        success: false,
        message: 'Slack is not connected',
        error: slackClientResult.error,
      };
    }

    if (!isNonEmptyString(slackUserId) && isNonEmptyString(email)) {
      let resolvedUser;

      try {
        resolvedUser = await resolveSlackUserByEmail(
          slackClientResult.client,
          email,
        );
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
            'No Slack user with that email in the installed workspace. For a guest or Slack Connect user from another workspace, enter their Slack user id instead.',
        };
      }

      slackUserId = resolvedUser.slackUserId;
      slackTeamId = slackTeamId ?? resolvedUser.slackTeamId;
      resolvedName = resolvedName ?? resolvedUser.displayName;
    }

    if (!isNonEmptyString(slackTeamId)) {
      slackTeamId = await getInstalledSlackTeamId(slackClientResult.client);
    }
  }

  if (!isNonEmptyString(slackUserId)) {
    return {
      success: false,
      message: 'Could not resolve the Slack user',
      error: 'Slack did not return a user id for that email.',
    };
  }

  if (!isNonEmptyString(slackTeamId)) {
    return {
      success: false,
      message: 'Could not resolve the Slack workspace',
      error: 'Slack did not return a team id for the installed connection.',
    };
  }

  const client = new CoreApiClient({ runAs: 'application' });

  let existingLink: SlackUserLink | undefined;

  try {
    existingLink = await findSlackUserLink(client, {
      slackTeamId,
      slackUserId,
    });
  } catch (error) {
    return {
      success: false,
      message: 'Could not look up the existing link',
      error: error instanceof Error ? error.message : String(error),
    };
  }

  try {
    if (isDefined(existingLink)) {
      await updateSlackUserLink(client, {
        id: existingLink.id,
        workspaceMemberId,
        name: resolvedName,
        source: SLACK_USER_LINK_SOURCE.MANUAL,
      });
    } else {
      await createSlackUserLink(client, {
        slackTeamId,
        slackUserId,
        workspaceMemberId,
        name: isNonEmptyString(resolvedName) ? resolvedName : slackUserId,
        source: SLACK_USER_LINK_SOURCE.MANUAL,
      });
    }
  } catch (error) {
    return {
      success: false,
      message: 'Could not save the link',
      error: error instanceof Error ? error.message : String(error),
    };
  }

  return {
    success: true,
    message: `Linked Slack user ${slackUserId} to workspace member ${workspaceMemberId}.`,
  };
};
