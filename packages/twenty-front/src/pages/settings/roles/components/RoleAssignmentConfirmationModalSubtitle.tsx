import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconChevronRight, IconUser } from 'twenty-ui';
import { SelectedWorkspaceMember } from '~/pages/settings/roles/components/RoleAssignmentConfirmationModal';
import { RoleAssignmentConfirmationModalMode } from '~/pages/settings/roles/types/RoleAssignmentConfirmationModalMode';

const StyledRoleButton = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(0, 4)};

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledLeftContent = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type RoleAssignmentConfirmationModalSubtitleProps = {
  mode: RoleAssignmentConfirmationModalMode;
  selectedWorkspaceMember: SelectedWorkspaceMember;
  onRoleClick: (roleId: string) => void;
};

export const RoleAssignmentConfirmationModalSubtitle = ({
  mode,
  selectedWorkspaceMember,
  onRoleClick,
}: RoleAssignmentConfirmationModalSubtitleProps) => {
  const theme = useTheme();
  const isAssignMode = mode === 'assign';
  const hasExistingRole = !!selectedWorkspaceMember.role;

  const workspaceMemberName = selectedWorkspaceMember.name;

  if (isAssignMode && hasExistingRole) {
    return (
      <>
        {t`${workspaceMemberName} will be unassigned from the following role:`}
        <StyledRoleButton
          onClick={() =>
            selectedWorkspaceMember.role &&
            onRoleClick(selectedWorkspaceMember.role.id)
          }
        >
          <StyledLeftContent>
            <IconUser size={theme.icon.size.sm} />
            {selectedWorkspaceMember.role?.label}
          </StyledLeftContent>
          <IconChevronRight size={theme.icon.size.sm} />
        </StyledRoleButton>
      </>
    );
  }

  return isAssignMode
    ? t`Are you sure you want to assign this role?`
    : t`This member will be unassigned from this role.`;
};
