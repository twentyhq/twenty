import { isDefined } from 'twenty-shared/utils';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// An item carries only the assignee's userWorkspaceId, so who that is comes
// from the members the app already loaded rather than from a second request.
export const useInboxItemAssignee = (
  assigneeUserWorkspaceId: string | null | undefined,
): PartialWorkspaceMember | undefined => {
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  if (!isDefined(assigneeUserWorkspaceId)) {
    return undefined;
  }

  return currentWorkspaceMembers.find(
    (workspaceMember) =>
      workspaceMember.userWorkspaceId === assigneeUserWorkspaceId,
  );
};
