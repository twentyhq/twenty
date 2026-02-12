import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  AppTooltip,
  Avatar,
  IconChevronRight,
  IconLock,
  TooltipDelay,
  useIcons,
} from 'twenty-ui/display';

import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

const StyledAssignedText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledNameCell = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledAvatarGroup = styled.div`
  display: flex;
  justify-content: flex-end;

  > * {
    margin-left: -5px;

    &:first-of-type {
      margin-left: 0;
    }
  }
`;

const StyledIconLockContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
`;

const StyledTableRow = styled(TableRow)`
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
    cursor: pointer;
  }
`;

type SettingsRolesTableRowProps = {
  role: RoleWithPartialMembers;
};

export const SettingsRolesTableRow = ({ role }: SettingsRolesTableRowProps) => {
  const theme = useTheme();

  const { getIcon } = useIcons();
  const Icon = getIcon(role.icon ?? 'IconUser');

  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);

  const enrichedWorkspaceMembers = role.workspaceMembers
    .map((workspaceMember) =>
      currentWorkspaceMembers.find(
        (member) => member.id === workspaceMember.id,
      ),
    )
    .filter(isDefined);

  return (
    <StyledTableRow
      key={role.id}
      gridAutoColumns="332px 3fr 2fr 1fr"
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
        <StyledAvatarGroup>
          {enrichedWorkspaceMembers.slice(0, 5).map((workspaceMember) => (
            <React.Fragment key={workspaceMember.id}>
              <div id={`avatar-${workspaceMember.id}`}>
                <Avatar
                  avatarUrl={workspaceMember.avatarUrl}
                  placeholderColorSeed={workspaceMember.id}
                  placeholder={workspaceMember.name.firstName ?? ''}
                  type="rounded"
                  size="md"
                />
              </div>
              <AppTooltip
                anchorSelect={`#avatar-${workspaceMember.id}`}
                content={`${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`}
                noArrow
                place="top"
                positionStrategy="fixed"
                delay={TooltipDelay.shortDelay}
              />
            </React.Fragment>
          ))}
        </StyledAvatarGroup>
      </TableCell>
      <TableCell align="left">
        <StyledAssignedText>{role.workspaceMembers.length}</StyledAssignedText>
      </TableCell>
      <TableCell align="right" color={theme.font.color.tertiary}>
        <IconChevronRight size={theme.icon.size.md} />
      </TableCell>
    </StyledTableRow>
  );
};
