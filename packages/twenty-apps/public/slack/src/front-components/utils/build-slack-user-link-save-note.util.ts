import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackUserLinkRecord } from 'src/front-components/types/slack-user-link-record.type';
import { type WorkspaceMemberOption } from 'src/front-components/types/workspace-member-option.type';
import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

export const buildSlackUserLinkSaveNote = ({
  resolvedUser,
  selectedMember,
  existingLink,
}: {
  resolvedUser: SlackResolvedUser;
  selectedMember: WorkspaceMemberOption | null;
  existingLink: SlackUserLinkRecord | undefined;
}): string => {
  if (!isDefined(selectedMember)) {
    return 'Pick the workspace member this Slack account should act as.';
  }

  const isSameMemberRelink =
    isDefined(existingLink) &&
    existingLink.workspaceMemberId === selectedMember.id;

  if (isSameMemberRelink) {
    if (existingLink.consentState === SLACK_USER_LINK_CONSENT_STATE.DECLINED) {
      return 'This person already declined this link, and saving will not ask them again. Remove the link and add it back to ask once more.';
    }

    if (existingLink.consentState === SLACK_USER_LINK_CONSENT_STATE.PENDING) {
      return 'This link is already awaiting their approval; saving sends no new request. Use resend on the link below to nudge them.';
    }

    return 'This Slack account is already linked to this member, so saving changes nothing.';
  }

  const replacementPrefix = isDefined(existingLink)
    ? 'This Slack account is linked to another member; saving replaces that link. '
    : '';

  if (!resolvedUser.isInInstalledWorkspace) {
    return `${replacementPrefix}This account is outside your Slack workspace, so the link is admin-set and active right away.`;
  }

  const matchesSelectedMember =
    isNonEmptyString(resolvedUser.email) &&
    isNonEmptyString(selectedMember.userEmail) &&
    resolvedUser.email.toLowerCase() === selectedMember.userEmail.toLowerCase();

  if (matchesSelectedMember) {
    return `${replacementPrefix}The emails match, so the link activates immediately with no approval step.`;
  }

  const displayName = isNonEmptyString(resolvedUser.displayName)
    ? resolvedUser.displayName
    : 'this person';

  return `${replacementPrefix}Saving will send ${displayName} an approval request in Slack. The link activates once they approve.`;
};
