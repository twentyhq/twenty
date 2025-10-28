import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { type SettingsRoleAssignmentConfirmationModalSelectedRoleTarget } from '@/settings/roles/role-assignment/types/SettingsRoleAssignmentConfirmationModalSelectedRoleTarget';

import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { Avatar } from 'twenty-ui/display';

const StyledSettingsCardContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(6)};
`;

type SettingsRoleAssignmentConfirmationModalSubtitleProps = {
  selectedRoleTarget: SettingsRoleAssignmentConfirmationModalSelectedRoleTarget;
  onRoleClick: (roleId: string) => void;
};

export const SettingsRoleAssignmentConfirmationModalSubtitle = ({
  selectedRoleTarget,
  onRoleClick,
}: SettingsRoleAssignmentConfirmationModalSubtitleProps) => {
  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);

  const enrichedSelectedWorkspaceMember = currentWorkspaceMembers.find(
    (member) => member.id === selectedRoleTarget.id,
  );

  const workspaceMemberName = enrichedSelectedWorkspaceMember
    ? `${enrichedSelectedWorkspaceMember?.name.firstName} ${enrichedSelectedWorkspaceMember?.name.lastName}`
    : selectedRoleTarget.name;

  return (
    <>
      {t`${workspaceMemberName} will be unassigned from the following role:`}
      <StyledSettingsCardContainer>
        <SettingsCard
          title={selectedRoleTarget.role?.label || ''}
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
            selectedRoleTarget.role && onRoleClick(selectedRoleTarget.role.id)
          }
        />
      </StyledSettingsCardContainer>
    </>
  );
};
