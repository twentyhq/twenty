import { isNonEmptyString } from '@sniptt/guards';

import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';

export type AssignAiChatMemberOption = {
  workspaceMember: PartialWorkspaceMember;
  label: string;
};

// The member's own name comes first, as assigning to oneself is the most
// common pick
export const getAssignAiChatMemberOptions = ({
  workspaceMembers,
  currentWorkspaceMemberId,
  search,
}: {
  workspaceMembers: PartialWorkspaceMember[];
  currentWorkspaceMemberId: string | undefined;
  search: string;
}): AssignAiChatMemberOption[] => {
  const normalizedSearch = search.trim().toLowerCase();

  return workspaceMembers
    .map((workspaceMember) => ({
      workspaceMember,
      label: getWorkspaceMemberNameOrEmail(workspaceMember),
    }))
    .filter(
      ({ workspaceMember, label }) =>
        !isNonEmptyString(normalizedSearch) ||
        `${label} ${workspaceMember.userEmail}`
          .toLowerCase()
          .includes(normalizedSearch),
    )
    .sort(
      (memberA, memberB) =>
        Number(memberB.workspaceMember.id === currentWorkspaceMemberId) -
        Number(memberA.workspaceMember.id === currentWorkspaceMemberId),
    );
};
