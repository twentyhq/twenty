import { isNonEmptyString } from '@sniptt/guards';
import { type RoutePayload } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { createSlackUserLink } from 'src/logic-functions/data/create-slack-user-link';
import { findSlackUserLink } from 'src/logic-functions/data/find-slack-user-link';
import { findWorkspaceMemberNameById } from 'src/logic-functions/data/find-workspace-member-name-by-id';
import { updateSlackUserLink } from 'src/logic-functions/data/update-slack-user-link';
import { type SlackSetUserLinkInput } from 'src/logic-functions/types/slack-set-user-link-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { type SlackUserLink } from 'src/logic-functions/types/slack-user-link.type';
import { currentUserHasWorkspaceMembersPermission } from 'src/logic-functions/utils/current-user-has-workspace-members-permission';
import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { isConsentedSlackUserLink } from 'src/logic-functions/utils/is-consented-slack-user-link';
import { resolveSlackUserByEmail } from 'src/logic-functions/utils/resolve-slack-user-by-email';
import { asRecord, readOptionalString } from 'src/logic-functions/utils/route-body.util';
import { sendSlackUserLinkConsentDm } from 'src/logic-functions/utils/send-slack-user-link-consent-dm';

// The agent tool passes the input directly, the HTTP route wraps it in a RoutePayload body.
type SlackSetUserLinkPayload =
  | SlackSetUserLinkInput
  | RoutePayload<SlackSetUserLinkInput>;

const isRoutePayload = (
  payload: SlackSetUserLinkPayload,
): payload is RoutePayload<SlackSetUserLinkInput> => 'body' in payload;

// The HTTP route body is untrusted, so read each field rather than trusting its declared type.
const toSlackSetUserLinkInput = (source: unknown): SlackSetUserLinkInput => {
  const body = asRecord(source);

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

  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return {
      success: false,
      message: 'Slack is not connected',
      error: slackClientResult.error,
    };
  }

  const slackClient = slackClientResult.client;

  let slackUserId = requestedSlackUserId;
  let slackTeamId = requestedSlackTeamId;
  let resolvedName = name;

  if (!isNonEmptyString(slackUserId) && isNonEmptyString(email)) {
    const resolvedUser = await resolveSlackUserByEmail(slackClient, email);

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

  const installedTeamId = await getInstalledSlackTeamId(slackClient);

  if (!isNonEmptyString(slackTeamId)) {
    slackTeamId = installedTeamId;
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

  // We can only ask for consent from someone in the installed workspace; guests
  // and Slack Connect users from another workspace cannot be DMed, so an admin
  // link for them is authoritative on save.
  const isInInstalledWorkspace =
    isNonEmptyString(installedTeamId) && slackTeamId === installedTeamId;

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

  // Re-linking the same member on an already-consented link must not knock it
  // back to pending; only a new person, or a not-yet-consented link, needs a
  // fresh consent request.
  const keepsExistingConsent =
    isDefined(existingLink) &&
    existingLink.workspaceMemberId === workspaceMemberId &&
    isConsentedSlackUserLink(existingLink.consentState);

  const requiresConsent = isInInstalledWorkspace && !keepsExistingConsent;

  const consentStateForWrite = isInInstalledWorkspace
    ? requiresConsent
      ? SLACK_USER_LINK_CONSENT_STATE.PENDING
      : undefined
    : SLACK_USER_LINK_CONSENT_STATE.ADMIN_SET;

  try {
    if (isDefined(existingLink)) {
      await updateSlackUserLink(client, {
        id: existingLink.id,
        workspaceMemberId,
        name: resolvedName,
        source: SLACK_USER_LINK_SOURCE.MANUAL,
        consentState: consentStateForWrite,
      });
    } else {
      await createSlackUserLink(client, {
        slackTeamId,
        slackUserId,
        workspaceMemberId,
        name: isNonEmptyString(resolvedName) ? resolvedName : slackUserId,
        source: SLACK_USER_LINK_SOURCE.MANUAL,
        consentState: consentStateForWrite,
      });
    }
  } catch (error) {
    return {
      success: false,
      message: 'Could not save the link',
      error: error instanceof Error ? error.message : String(error),
    };
  }

  if (!isInInstalledWorkspace) {
    return {
      success: true,
      message: `Linked Slack user ${slackUserId} to workspace member ${workspaceMemberId}. This account is outside the installed workspace, so it is admin-set without a consent request.`,
    };
  }

  if (!requiresConsent) {
    return {
      success: true,
      message: `Updated the link for Slack user ${slackUserId}. It is already active for that workspace member, so no new consent request was sent.`,
    };
  }

  const memberName = await findWorkspaceMemberNameById(client, workspaceMemberId);

  const dmResult = await sendSlackUserLinkConsentDm(slackClient, {
    slackTeamId,
    slackUserId,
    memberName,
  });

  if (!dmResult.success) {
    return {
      success: true,
      message: `Saved a pending link for Slack user ${slackUserId}, but could not deliver the consent request (${dmResult.error}). Resend it from the settings tab.`,
    };
  }

  return {
    success: true,
    message: `Asked Slack user ${slackUserId} to approve linking to workspace member ${workspaceMemberId}. The link activates once they approve.`,
  };
};
