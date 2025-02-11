import { SettingsCard } from '@/settings/components/SettingsCard';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconUser } from 'twenty-ui';
import { RoleAssignmentConfirmationModalMode } from '~/pages/settings/roles/types/RoleAssignmentConfirmationModalMode';
import { RoleAssignmentConfirmationModalSelectedWorkspaceMember } from '~/pages/settings/roles/types/RoleAssignmentConfirmationModalSelectedWorkspaceMember';

const StyledSettingsCardContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

type RoleAssignmentConfirmationModalSubtitleProps = {
  mode: RoleAssignmentConfirmationModalMode;
  selectedWorkspaceMember: RoleAssignmentConfirmationModalSelectedWorkspaceMember;
  onRoleClick: (roleId: string) => void;
};

export const RoleAssignmentConfirmationModalSubtitle = ({
  mode,
  selectedWorkspaceMember,
  onRoleClick,
}: RoleAssignmentConfirmationModalSubtitleProps) => {
  const isAssignMode = mode === 'assign';
  const hasExistingRole = !!selectedWorkspaceMember.role;

  const workspaceMemberName = selectedWorkspaceMember.name;

  if (isAssignMode && hasExistingRole) {
    return (
      <>
        {t`${workspaceMemberName} will be unassigned from the following role:`}
        <StyledSettingsCardContainer>
          <SettingsCard
            title={selectedWorkspaceMember.role?.label || ''}
            Icon={<IconUser />}
            onClick={() =>
              selectedWorkspaceMember.role &&
              onRoleClick(selectedWorkspaceMember.role.id)
            }
          />
        </StyledSettingsCardContainer>
      </>
    );
  }

  return isAssignMode
    ? t`Are you sure you want to assign this role?`
    : t`This member will be unassigned from this role.`;
};
