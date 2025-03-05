import { SettingsPath } from '@/types/SettingsPath';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
import {
  AppTooltip,
  Avatar,
  IconChevronRight,
  IconLock,
  IconUser,
  TooltipDelay,
} from 'twenty-ui';
import { Role } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledAvatarContainer = styled.div`
  border: 0px;
`;

const StyledAssignedText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledNameCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledAssignedCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledAvatarGroup = styled.div`
  align-items: center;
  display: flex;
  margin-right: ${({ theme }) => theme.spacing(1)};

  > * {
    margin-left: -5px;

    &:first-of-type {
      margin-left: 0;
    }
  }
`;

const StyledTableRow = styled(TableRow)`
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
    cursor: pointer;
  }
`;

export const RolesTableRow = ({ role }: { role: Role }) => {
  const theme = useTheme();

  const navigateSettings = useNavigateSettings();

  const handleRoleClick = (roleId: string) => {
    navigateSettings(SettingsPath.RoleDetail, { roleId });
  };

  return (
    <StyledTableRow
      key={role.id}
      gridAutoColumns="3fr 2fr 1fr"
      onClick={() => handleRoleClick(role.id)}
    >
      <TableCell>
        <StyledNameCell>
          <IconUser size={theme.icon.size.md} />
          {role.label}
          {!role.isEditable && <IconLock size={theme.icon.size.sm} />}
        </StyledNameCell>
      </TableCell>
      <TableCell align={'right'}>
        <StyledAssignedCell>
          <StyledAvatarGroup>
            {role.workspaceMembers.slice(0, 5).map((workspaceMember) => (
              <React.Fragment key={workspaceMember.id}>
                <StyledAvatarContainer id={`avatar-${workspaceMember.id}`}>
                  <Avatar
                    avatarUrl={workspaceMember.avatarUrl}
                    placeholderColorSeed={workspaceMember.id}
                    placeholder={workspaceMember.name.firstName ?? ''}
                    type="rounded"
                    size="md"
                  />
                </StyledAvatarContainer>
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
          <StyledAssignedText>
            {role.workspaceMembers.length}
          </StyledAssignedText>
        </StyledAssignedCell>
      </TableCell>
      <TableCell align={'right'}>
        <StyledIconChevronRight size={theme.icon.size.md} />
      </TableCell>
    </StyledTableRow>
  );
};
