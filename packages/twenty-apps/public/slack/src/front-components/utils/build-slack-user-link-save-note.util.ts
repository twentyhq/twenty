import { isNonEmptyString } from '@sniptt/guards';

import { type WorkspaceMemberOption } from 'src/front-components/types/workspace-member-option.type';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

// Saving a link can DM a real person, so the outcome is spelled out next to
// the save button before the admin commits.
export const buildSlackUserLinkSaveNote = ({
  resolvedUser,
  selectedMember,
}: {
  resolvedUser: SlackResolvedUser;
  selectedMember: WorkspaceMemberOption | null;
}): string => {
  if (!resolvedUser.isInInstalledWorkspace) {
    return 'This account is outside your Slack workspace, so the link is admin-set and active right away.';
  }

  if (selectedMember === null) {
    return 'Pick the workspace member this Slack account should act as.';
  }

  const matchesSelectedMember =
    isNonEmptyString(resolvedUser.email) &&
    isNonEmptyString(selectedMember.userEmail) &&
    resolvedUser.email.toLowerCase() === selectedMember.userEmail.toLowerCase();

  if (matchesSelectedMember) {
    return 'The emails match, so the link activates immediately with no approval step.';
  }

  const displayName = isNonEmptyString(resolvedUser.displayName)
    ? resolvedUser.displayName
    : 'this person';

  return `Saving will send ${displayName} an approval request in Slack. The link activates once they approve.`;
};
