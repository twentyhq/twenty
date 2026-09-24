import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { ActorDisplay } from '@/ui/field/display/components/ActorDisplay';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledUnknownMember = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

type SettingsLogsMemberCellProps = {
  userId?: string | null;
  userWorkspaceId?: string | null;
};

export const SettingsLogsMemberCell = ({
  userId,
  userWorkspaceId,
}: SettingsLogsMemberCellProps) => {
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  const workspaceMember = isDefined(userWorkspaceId)
    ? currentWorkspaceMembers.find(
        (member) => member.userWorkspaceId === userWorkspaceId,
      )
    : currentWorkspaceMembers.find((member) => member.userId === userId);

  if (!isDefined(workspaceMember)) {
    return <StyledUnknownMember>—</StyledUnknownMember>;
  }

  return (
    <ActorDisplay
      name={`${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`}
      avatarUrl={workspaceMember.avatarUrl}
      workspaceMemberId={workspaceMember.id}
    />
  );
};
