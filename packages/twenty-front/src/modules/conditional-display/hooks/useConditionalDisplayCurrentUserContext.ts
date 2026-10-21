import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useConditionalDisplayCurrentUserContext = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const currentUserRole = currentWorkspaceMember?.roles?.find(
    (role) => role.canBeAssignedToUsers,
  );

  return {
    currentRoleId: currentUserRole?.id ?? null,
    currentWorkspaceMemberId: currentWorkspaceMember?.id ?? null,
  };
};
