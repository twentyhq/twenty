import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { findSlackUserLink } from 'src/logic-functions/data/find-slack-user-link';
import { findWorkspaceMemberNameById } from 'src/logic-functions/data/find-workspace-member-name-by-id';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { type SlackUserLink } from 'src/logic-functions/types/slack-user-link.type';
import { currentUserHasWorkspaceMembersPermission } from 'src/logic-functions/utils/current-user-has-workspace-members-permission';
import { decideSlackUserLinkWrite } from 'src/logic-functions/utils/decide-slack-user-link-write';
import {
  extractSlackSetUserLinkInput,
  type SlackSetUserLinkPayload,
} from 'src/logic-functions/utils/extract-slack-set-user-link-input';
import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { persistSlackUserLink } from 'src/logic-functions/utils/persist-slack-user-link';
import { resolveLinkTargetByEmail } from 'src/logic-functions/utils/resolve-link-target-by-email';
import { resolveLinkTargetById } from 'src/logic-functions/utils/resolve-link-target-by-id';
import { sendSlackUserLinkConsentDm } from 'src/logic-functions/utils/send-slack-user-link-consent-dm';

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
  // Slack-verified profile email, feeding the consent-skipping match below.
  let slackUserEmail: string | undefined;
  let fetchedIdentity: SlackUserIdentity | undefined;

  if (!isNonEmptyString(slackUserId) && isNonEmptyString(email)) {
    const emailTarget = await resolveLinkTargetByEmail({
      slackClient,
      email,
      requestedSlackTeamId,
    });

    if (!emailTarget.success) {
      return emailTarget;
    }

    slackUserId = emailTarget.slackUserId;
    slackTeamId = emailTarget.slackTeamId;
    resolvedName = resolvedName ?? emailTarget.displayName;
    // A users.lookupByEmail hit certifies this is the account's Slack email.
    slackUserEmail = email;
  }

  if (isNonEmptyString(requestedSlackUserId)) {
    const idTarget = await resolveLinkTargetById({
      slackClient,
      slackUserId: requestedSlackUserId,
      requestedSlackTeamId,
    });

    if (!idTarget.success) {
      return idTarget;
    }

    slackTeamId = idTarget.slackTeamId;
    fetchedIdentity = idTarget.identity;
    resolvedName = resolvedName ?? idTarget.identity?.displayName;
  }

  const installedTeamId = await getInstalledSlackTeamId(slackClient);

  // The consent decision hinges on whether the user is in the installed
  // workspace, so a failed team lookup must fail closed rather than silently
  // admin-set an in-workspace user without ever asking them.
  if (!isNonEmptyString(installedTeamId)) {
    return {
      success: false,
      message: 'Could not verify the installed Slack workspace',
      error: 'Slack did not confirm the installed workspace. Please try again.',
    };
  }

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
  const isInInstalledWorkspace = slackTeamId === installedTeamId;

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

  // A same-member re-save changes nothing about the mapping, so it must not
  // re-open consent: an ACTIVE/ADMIN_SET link stays as is, a pending one is
  // left for the resend action, and a decline is respected rather than silently
  // re-requested. Consent is only (re-)asked for a new link or a new member; to
  // ask a declined user again, remove the link and add it back.
  const isSameMemberRelink =
    isDefined(existingLink) &&
    existingLink.workspaceMemberId === workspaceMemberId;

  const {
    isEagerAutoMatch,
    requiresConsent,
    consentState: consentStateForWrite,
    source: sourceForWrite,
  } = await decideSlackUserLinkWrite({
    client,
    slackClient,
    slackUserId,
    workspaceMemberId,
    slackUserEmail,
    fetchedIdentity,
    isInInstalledWorkspace,
    isSameMemberRelink,
  });

  let slackUserLinkId: string;

  try {
    slackUserLinkId = await persistSlackUserLink(client, {
      existingLink,
      isSameMemberRelink,
      slackTeamId,
      slackUserId,
      workspaceMemberId,
      name: resolvedName,
      source: sourceForWrite,
      consentState: consentStateForWrite,
    });
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

  if (isEagerAutoMatch) {
    return {
      success: true,
      message: `Linked Slack user ${slackUserId} to workspace member ${workspaceMemberId}. Their Slack email matches this member, so the link is active immediately with no approval step.`,
    };
  }

  if (!requiresConsent) {
    const stateNote =
      existingLink?.consentState === SLACK_USER_LINK_CONSENT_STATE.DECLINED
        ? 'They previously declined, so their choice stands and no new request was sent. Remove the link and add it again to ask them once more.'
        : existingLink?.consentState === SLACK_USER_LINK_CONSENT_STATE.PENDING
          ? 'It is still awaiting their approval, so no new request was sent. Use resend to nudge them.'
          : 'It is already active for that workspace member, so no new consent request was sent.';

    return {
      success: true,
      message: `Updated the link for Slack user ${slackUserId}. ${stateNote}`,
    };
  }

  const memberName = await findWorkspaceMemberNameById(
    client,
    workspaceMemberId,
  );

  const dmResult = await sendSlackUserLinkConsentDm(slackClient, {
    slackTeamId,
    slackUserId,
    workspaceMemberId,
    slackUserLinkId,
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
