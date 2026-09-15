import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconChevronRight, IconLock, useIcons } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { WorkspaceMemberAvatarStack } from '@/workspace-member/components/WorkspaceMemberAvatarStack';

const StyledNameCell = styled.div`
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledAssignedToCell = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StyledIconLockContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
`;

const StyledTableRowContainer = styled.div`
  > * {
    &:hover {
      background: ${themeCssVariables.background.transparent.light};
      cursor: pointer;
    }
  }
`;

type SettingsRolesTableRowProps = {
  role: RoleWithPartialMembers;
};

const MAX_VISIBLE_ROLE_MEMBER_AVATARS = 5;

export const SettingsRolesTableRow = ({ role }: SettingsRolesTableRowProps) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const Icon = getIcon(role.icon ?? 'IconUser');

  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  const enrichedWorkspaceMembers = role.workspaceMembers.map(
    (workspaceMember) =>
      currentWorkspaceMembers.find(
        (member) => member.id === workspaceMember.id,
      ) ?? workspaceMember,
  );

  return (
    <StyledTableRowContainer>
      <TableRow
        key={role.id}
        gridAutoColumns="332px 5fr 1fr"
        mobileGridAutoColumns="5fr 2fr 35px"
        to={getSettingsPath(SettingsPath.RoleDetail, { roleId: role.id })}
      >
        <TableCell>
          <StyledNameCell>
            <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
            {role.label}
            {!role.isEditable && (
              <StyledIconLockContainer>
                <IconLock
                  color={theme.font.color.light}
                  stroke={theme.icon.stroke.sm}
                  size={theme.icon.size.sm}
                />
              </StyledIconLockContainer>
            )}
          </StyledNameCell>
        </TableCell>
        <TableCell align="right">
          <StyledAssignedToCell>
            <WorkspaceMemberAvatarStack
              defaultAvatarName={t`Workspace member`}
              maxVisible={MAX_VISIBLE_ROLE_MEMBER_AVATARS}
              totalWorkspaceMembersCount={role.workspaceMembers.length}
              workspaceMembers={enrichedWorkspaceMembers}
            />
          </StyledAssignedToCell>
        </TableCell>
        <TableCell align="right" color={theme.font.color.tertiary}>
          <IconChevronRight size={theme.icon.size.md} />
        </TableCell>
      </TableRow>
    </StyledTableRowContainer>
  );
};
