import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsRoleAssignmentConfirmationModalSelectedWorkspaceMember } from '@/settings/roles/role-assignment/types/SettingsRoleAssignmentConfirmationModalSelectedWorkspaceMember';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Avatar } from 'twenty-ui';

const StyledSettingsCardContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(6)};
`;

type SettingsRoleAssignmentConfirmationModalSubtitleProps = {
  selectedWorkspaceMember: SettingsRoleAssignmentConfirmationModalSelectedWorkspaceMember;
  onRoleClick: (roleId: string) => void;
};

export const SettingsRoleAssignmentConfirmationModalSubtitle = ({
  selectedWorkspaceMember,
  onRoleClick,
}: SettingsRoleAssignmentConfirmationModalSubtitleProps) => {
  const workspaceMemberName = selectedWorkspaceMember.name;

  return (
    <>
      {t`${workspaceMemberName} will be unassigned from the following role:`}
      <StyledSettingsCardContainer>
        <SettingsCard
          title={selectedWorkspaceMember.role?.label || ''}
          Icon={
            <Avatar
              avatarUrl={selectedWorkspaceMember.avatarUrl}
              placeholderColorSeed={selectedWorkspaceMember.id}
              placeholder={selectedWorkspaceMember.name}
              size="md"
              type="rounded"
            />
          }
          onClick={() =>
            selectedWorkspaceMember.role &&
            onRoleClick(selectedWorkspaceMember.role.id)
          }
        />
      </StyledSettingsCardContainer>
    </>
  );
};
