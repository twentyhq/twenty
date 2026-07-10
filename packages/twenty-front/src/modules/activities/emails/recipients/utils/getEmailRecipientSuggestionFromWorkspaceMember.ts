import { isNonEmptyString } from '@sniptt/guards';

import { type EmailRecipientSuggestion } from '@/activities/emails/recipients/types/EmailRecipientSuggestion';
import { getEmailRecipientFullName } from '@/activities/emails/recipients/utils/getEmailRecipientFullName';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

export const getEmailRecipientSuggestionFromWorkspaceMember = ({
  workspaceMember,
  teamMemberLabel,
}: {
  workspaceMember: PartialWorkspaceMember;
  teamMemberLabel: string;
}): EmailRecipientSuggestion => {
  const address = workspaceMember.userEmail;
  const fullName = getEmailRecipientFullName(workspaceMember.name);
  const hasFullName = isNonEmptyString(fullName);

  return {
    suggestionId: `workspace-member-${workspaceMember.id}`,
    recipient: hasFullName ? { address, displayName: fullName } : { address },
    label: hasFullName ? fullName : address,
    secondaryText: hasFullName
      ? `${address} · ${teamMemberLabel}`
      : teamMemberLabel,
    avatarUrl: workspaceMember.avatarUrl ?? undefined,
    avatarColorSeed: workspaceMember.id,
  };
};
