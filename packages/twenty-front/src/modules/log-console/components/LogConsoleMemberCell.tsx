import { isDefined } from 'twenty-shared/utils';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { ActorDisplay } from '@/ui/field/display/components/ActorDisplay';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type LogConsoleMemberCellProps = {
  userId?: string | null;
  userWorkspaceId?: string | null;
};

export const LogConsoleMemberCell = ({
  userId,
  userWorkspaceId,
}: LogConsoleMemberCellProps) => {
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  const workspaceMember = isDefined(userWorkspaceId)
    ? currentWorkspaceMembers.find(
        (member) => member.userWorkspaceId === userWorkspaceId,
      )
    : currentWorkspaceMembers.find((member) => member.userId === userId);

  if (!isDefined(workspaceMember)) {
    return null;
  }

  return (
    <ActorDisplay
      name={`${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`}
      avatarUrl={workspaceMember.avatarUrl}
      workspaceMemberId={workspaceMember.id}
    />
  );
};
