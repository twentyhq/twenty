import styled from '@emotion/styled';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { IconTrash, useIcons } from 'twenty-ui';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindRoleById } from '@/settings/roles/hooks/useFindRoleById';
import { useUpdateWorkspaceMember } from '@/settings/roles/hooks/useUpdateWorkspaceMember';
import { InvitedMember } from '@/settings/roles/types/InvitedMember';
import { Role } from '@/settings/roles/types/Role';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { SelectOption } from '@/ui/input/components/Select';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { Section } from '@/ui/layout/section/components/Section';
import { MemberSelectRole } from '@/workspace-member/components/MemberSelectRole';
import { MemberSelectStatus } from '@/workspace-member/components/MemberSelectStatus';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { WorkspaceInvitedMemberCard } from '@/workspace/components/WorkspaceInvitedMemberCard';
import { WorkspaceMemberCard } from '@/workspace/components/WorkspaceMemberCard';
import { IconPointFilled } from '@tabler/icons-react';

type MembersTabContentProps = {
  roles: Role[];
  workspaceMembers: WorkspaceMember[];
  invitedMembers: InvitedMember[];
  activeTabId: string;
  onUpdateMember: () => void;
  filteredWorkspaceMembers: WorkspaceMember[];
};

type StatusType = 'ACTIVE' | 'SUSPENDED';

const StyledSection = styled(Section)`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin-left: ${({ theme }) => theme.spacing(3)};
`;

const StyledMemberSelectRole = styled(MemberSelectRole)`
  margin-right: ${({ theme }) => theme.spacing(3)};
`;

export const MembersTabContent = ({
  roles,
  activeTabId,
  workspaceMembers,
  invitedMembers,
  onUpdateMember,
  filteredWorkspaceMembers,
}: MembersTabContentProps) => {
  const { t } = useTranslation();
  const { getIcon } = useIcons();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [changeType, setChangeType] = useState<'role' | 'status' | undefined>();
  const [selectedMemberId, setSelectedMemberId] = useState<string>();
  const [selectedRoleId, setSelectedRoleId] = useState<string>();

  const { toggleMemberStatus, updateMemberRole } = useUpdateWorkspaceMember();
  const { deleteOneRecord: deleteOneWorkspaceMember } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const currentMember = workspaceMembers?.find(
    (member) => member.id === currentWorkspaceMember?.id,
  );

  const currentRoleId = currentMember?.roleId || '';
  const { role: currentUserRole } = useFindRoleById(currentRoleId);
  const isManager = currentUserRole?.name === 'Manager';

  const roleOptions: SelectOption<string | number>[] = roles?.map((role) => ({
    value: role.id,
    label: role.name,
    Icon: role.icon ? getIcon(role.icon) : undefined,
  }));

  const handleRemoveWorkspaceMember = async (workspaceMemberId: string) => {
    await deleteOneWorkspaceMember?.(workspaceMemberId);
    setIsDeleteModalOpen(false);
  };

  const handleSelectRole = (memberId: string, roleId: string) => {
    setSelectedMemberId(memberId);
    setSelectedRoleId(roleId);
    setChangeType('role');
    setIsChangeModalOpen(true);
  };

  const handleSelectStatus = (memberId: string) => {
    setSelectedMemberId(memberId);
    setChangeType('status');
    setIsChangeModalOpen(true);
  };

  const handleConfirmChange = async () => {
    const workspaceId = currentWorkspace?.id;

    if (changeType === 'status' && selectedMemberId) {
      await toggleMemberStatus(selectedMemberId, workspaceId);
      onUpdateMember();
    } else if (changeType === 'role' && selectedMemberId && selectedRoleId) {
      await updateMemberRole(selectedRoleId, selectedMemberId, workspaceId);
      onUpdateMember();
    }
    setIsChangeModalOpen(false);
  };

  return (
    <>
      {filteredWorkspaceMembers.length > 0 && (
        <StyledSection>
          {filteredWorkspaceMembers.map((member) => (
            <WorkspaceMemberCard
              key={member.id}
              workspaceMember={member as WorkspaceMember}
              accessory={
                <StyledButtonContainer>
                  <StyledMemberSelectRole
                    dropdownId={`member-role-${member.id}`}
                    options={roleOptions}
                    value={member.roleId}
                    onChange={(value) =>
                      handleSelectRole(member.userId, value as string)
                    }
                    disabled={!isManager}
                  />
                  <MemberSelectStatus
                    dropdownId={`member-status-${member.id}`}
                    options={[
                      {
                        Icon: IconPointFilled,
                        label: t('active'),
                        value: 'ACTIVE' as StatusType,
                      },
                      {
                        Icon: IconPointFilled,
                        label: t('suspended'),
                        value: 'SUSPENDED' as StatusType,
                      },
                    ]}
                    value={member.status as unknown as StatusType}
                    onChange={() => handleSelectStatus(member.userId)}
                    disabled={!isManager}
                  />
                  {isManager && (
                    <IconButton
                      onClick={() => {
                        setIsDeleteModalOpen(true);
                        setSelectedMemberId(member.id);
                      }}
                      variant="tertiary"
                      size="medium"
                      Icon={IconTrash}
                    />
                  )}
                </StyledButtonContainer>
              }
            />
          ))}
          {activeTabId === 'allroles' && invitedMembers.length > 0 && (
            <>
              {invitedMembers.map((member) => (
                <WorkspaceInvitedMemberCard
                  key={member.id}
                  invitedMember={member}
                />
              ))}
            </>
          )}
        </StyledSection>
      )}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        title={t('deleteAccountTitle')}
        subtitle={<>{t('deleteAccountWarning')}</>}
        onConfirmClick={() =>
          selectedMemberId && handleRemoveWorkspaceMember(selectedMemberId)
        }
        deleteButtonText={t('deleteAccountButtonText')}
      />
      <ConfirmationModal
        isOpen={isChangeModalOpen}
        setIsOpen={setIsChangeModalOpen}
        title={`Change ${changeType === 'role' ? 'role' : 'status'}`}
        subtitle={
          <>
            {t('areYouSureChangeMember')}{' '}
            {changeType === 'role' ? 'role' : 'status'}.
          </>
        }
        onConfirmClick={handleConfirmChange}
        deleteButtonText={t('continue')}
      />
    </>
  );
};
