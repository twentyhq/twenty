import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsRoleAssignmentConfirmationModalSelectedWorkspaceMember } from '@/settings/roles/role-assignment/types/SettingsRoleAssignmentConfirmationModalSelectedWorkspaceMember';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { Avatar } from 'twenty-ui/display';

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
  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);

  const enrichedSelectedWorkspaceMember = currentWorkspaceMembers.find(
    (member) => member.id === selectedWorkspaceMember.id,
  );

  const workspaceMemberName = `${enrichedSelectedWorkspaceMember?.name.firstName} ${enrichedSelectedWorkspaceMember?.name.lastName}`;

  return (
    <>
      {t`${workspaceMemberName} will be unassigned from the following role:`}
      <StyledSettingsCardContainer>
        <SettingsCard
          title={selectedWorkspaceMember.role?.label || ''}
          Icon={
            <Avatar
              avatarUrl={enrichedSelectedWorkspaceMember?.avatarUrl}
              placeholderColorSeed={enrichedSelectedWorkspaceMember?.id}
              placeholder={workspaceMemberName}
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
