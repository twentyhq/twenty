import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { doesWorkspaceMemberExist } from 'src/logic-functions/data/does-workspace-member-exist';
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
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const RELINK_STATE_NOTES: Record<string, string> = {
  [SLACK_USER_LINK_CONSENT_STATE.DECLINED]:
    'They previously declined, so their choice stands and no new request was sent. Remove the link and add it again to ask them once more.',
  [SLACK_USER_LINK_CONSENT_STATE.PENDING]:
    'It is still awaiting their approval, so no new request was sent. Use resend to nudge them.',
};

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
  }

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
      requestedSlackTeamId,
      installedSlackTeamId: installedTeamId,
    });

    if (!idTarget.success) {
      return idTarget;
    }

    slackTeamId = idTarget.slackTeamId;
    fetchedIdentity = idTarget.identity;
    resolvedName = resolvedName ?? idTarget.identity?.displayName;
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

  const isInInstalledWorkspace = slackTeamId === installedTeamId;

  const client = new CoreApiClient({ runAs: 'application' });

  let memberExists: boolean;

  try {
    memberExists = await doesWorkspaceMemberExist(client, workspaceMemberId);
  } catch (error) {
    return {
      success: false,
      message: 'Could not verify the workspace member',
      error: toErrorMessage(error),
    };
  }

  if (!memberExists) {
    return {
      success: false,
      message: 'Workspace member not found',
      error: `No workspace member with id ${workspaceMemberId}. Check the id and try again.`,
    };
  }

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
      error: toErrorMessage(error),
    };
  }

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
      error: toErrorMessage(error),
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
      RELINK_STATE_NOTES[existingLink?.consentState ?? ''] ??
      'It is already active for that workspace member, so no new consent request was sent.';

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
