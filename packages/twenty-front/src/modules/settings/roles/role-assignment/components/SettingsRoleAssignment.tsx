import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpdateWorkspaceMemberRole } from '@/settings/roles/hooks/useUpdateWorkspaceMemberRole';
import { SettingsRoleAssignmentConfirmationModal } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentConfirmationModal';
import { SettingsRoleAssignmentTableHeader } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentTableHeader';
import { SettingsRoleAssignmentWorkspaceMemberPickerDropdown } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentWorkspaceMemberPickerDropdown';
import { SettingsRoleAssignmentConfirmationModalSelectedWorkspaceMember } from '@/settings/roles/role-assignment/types/SettingsRoleAssignmentConfirmationModalSelectedWorkspaceMember';
import { settingsAllRolesSelector } from '@/settings/roles/states/settingsAllRolesSelector';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SettingsPath } from '@/types/SettingsPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  AppTooltip,
  Button,
  H2Title,
  IconPlus,
  IconSearch,
  Section,
  TooltipDelay,
} from 'twenty-ui';
import { SearchRecord } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SettingsRoleAssignmentTableRow } from './SettingsRoleAssignmentTableRow';

const StyledAssignToMemberContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSearchContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledTable = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledSearchInput = styled(TextInput)`
  input {
    background: ${({ theme }) => theme.background.transparent.lighter};
    border: 1px solid ${({ theme }) => theme.border.color.medium};
  }
`;

const StyledTableRows = styled.div`
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledNoMembers = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

type SettingsRoleAssignmentProps = {
  roleId: string;
  isCreateMode?: boolean;
};

export const SettingsRoleAssignment = ({
  roleId,
  isCreateMode,
}: SettingsRoleAssignmentProps) => {
  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const navigateSettings = useNavigateSettings();
  const {
    addWorkspaceMemberToRoleAndUpdateState,
    updateWorkspaceMemberRoleDraftState,
  } = useUpdateWorkspaceMemberRole(roleId);

  const [confirmationModalIsOpen, setConfirmationModalIsOpen] =
    useState<boolean>(false);
  const [selectedWorkspaceMember, setSelectedWorkspaceMember] =
    useState<SettingsRoleAssignmentConfirmationModalSelectedWorkspaceMember | null>(
      null,
    );
  const { closeDropdown } = useDropdown('role-member-select');
  const [searchFilter, setSearchFilter] = useState('');
  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const settingsAllRoles = useRecoilValue(settingsAllRolesSelector);

  const workspaceMemberRoleMap = new Map<
    string,
    { id: string; label: string }
  >();
  settingsAllRoles.forEach((role) => {
    if (!isDefined(role)) {
      return;
    }

    role.workspaceMembers.forEach((member) => {
      workspaceMemberRoleMap.set(member.id, { id: role.id, label: role.label });
    });
  });

  const filteredWorkspaceMembers = !searchFilter
    ? settingsDraftRole.workspaceMembers
    : settingsDraftRole.workspaceMembers.filter((member) => {
        const searchTerm = searchFilter.toLowerCase();
        const firstName = member.name.firstName?.toLowerCase() || '';
        const lastName = member.name.lastName?.toLowerCase() || '';
        const email = member.userEmail?.toLowerCase() || '';

        return (
          firstName.includes(searchTerm) ||
          lastName.includes(searchTerm) ||
          email.includes(searchTerm)
        );
      });

  const assignedWorkspaceMemberIds = settingsDraftRole.workspaceMembers.map(
    (workspaceMember) => workspaceMember.id,
  );

  const assignableWorkspaceMembers = currentWorkspaceMembers.filter(
    (member) => member.id !== currentWorkspaceMember?.id,
  );

  const allWorkspaceMembersHaveThisRole = assignableWorkspaceMembers.every(
    (member) => assignedWorkspaceMemberIds.includes(member.id),
  );

  const handleModalClose = () => {
    setConfirmationModalIsOpen(false);
    setSelectedWorkspaceMember(null);
  };

  const handleSelectWorkspaceMember = (
    workspaceMemberSearchRecord: SearchRecord,
  ) => {
    const existingRole = workspaceMemberRoleMap.get(
      workspaceMemberSearchRecord.recordId,
    );

    setSelectedWorkspaceMember({
      id: workspaceMemberSearchRecord.recordId,
      name: `${workspaceMemberSearchRecord.label}`,
      role: existingRole,
      avatarUrl: workspaceMemberSearchRecord.imageUrl,
    });
    setConfirmationModalIsOpen(true);
    closeDropdown();
  };

  const handleConfirm = async () => {
    if (!selectedWorkspaceMember || !confirmationModalIsOpen) return;

    if (!isCreateMode) {
      await addWorkspaceMemberToRoleAndUpdateState({
        workspaceMemberId: selectedWorkspaceMember.id,
      });
    } else {
      const workspaceMember = currentWorkspaceMembers.find(
        (member) => member.id === selectedWorkspaceMember.id,
      );

      if (!workspaceMember) return;

      updateWorkspaceMemberRoleDraftState({
        workspaceMember: {
          id: workspaceMember.id,
          name: workspaceMember.name,
          colorScheme: '',
          userEmail: '',
        },
      });
    }

    handleModalClose();
  };

  const handleRoleClick = (roleId: string) => {
    navigateSettings(SettingsPath.RoleDetail, { roleId });
    handleModalClose();
  };

  const handleSearchChange = (text: string) => {
    setSearchFilter(text);
  };

  return (
    <>
      <Section>
        <H2Title
          title={t`Assigned members`}
          description={t`This role is assigned to these workspace members.`}
        />
        <StyledSearchContainer>
          <StyledSearchInput
            value={searchFilter}
            onChange={handleSearchChange}
            placeholder={t`Search an assigned team member...`}
            fullWidth
            LeftIcon={IconSearch}
            sizeVariant="lg"
          />
        </StyledSearchContainer>
        <StyledTable>
          <SettingsRoleAssignmentTableHeader />
          <StyledTableRows>
            {filteredWorkspaceMembers.length > 0 ? (
              filteredWorkspaceMembers.map((workspaceMember) => (
                <SettingsRoleAssignmentTableRow
                  key={workspaceMember.id}
                  workspaceMember={workspaceMember}
                />
              ))
            ) : (
              <StyledNoMembers>
                {!searchFilter
                  ? t`No members assigned`
                  : t`No members match your search`}
              </StyledNoMembers>
            )}
          </StyledTableRows>
        </StyledTable>

        <StyledAssignToMemberContainer>
          <Dropdown
            dropdownId="role-member-select"
            dropdownHotkeyScope={{ scope: 'roleAssignment' }}
            clickableComponent={
              <>
                <div id="assign-member">
                  <Button
                    Icon={IconPlus}
                    title={t`Assign to member`}
                    variant="secondary"
                    size="small"
                    disabled={allWorkspaceMembersHaveThisRole}
                  />
                </div>
                <AppTooltip
                  anchorSelect="#assign-member"
                  content={t`No more members to assign`}
                  delay={TooltipDelay.noDelay}
                  hidden={!allWorkspaceMembersHaveThisRole}
                />
              </>
            }
            dropdownComponents={
              <SettingsRoleAssignmentWorkspaceMemberPickerDropdown
                excludedWorkspaceMemberIds={[
                  ...assignedWorkspaceMemberIds,
                  currentWorkspaceMember?.id,
                ]}
                onSelect={handleSelectWorkspaceMember}
              />
            }
          />
        </StyledAssignToMemberContainer>
      </Section>

      {confirmationModalIsOpen && selectedWorkspaceMember && (
        <SettingsRoleAssignmentConfirmationModal
          selectedWorkspaceMember={selectedWorkspaceMember}
          isOpen={true}
          onClose={handleModalClose}
          onConfirm={handleConfirm}
          onRoleClick={handleRoleClick}
        />
      )}
    </>
  );
};
