import {
  CurrentWorkspaceMember,
  currentWorkspaceMemberState,
} from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';
import { useUpdateWorkspaceMemberRole } from '@/settings/roles/hooks/useUpdateWorkspaceMemberRole';
import { SettingsRoleAssignmentConfirmationModal } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentConfirmationModal';
import { SettingsRoleAssignmentTableHeader } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentTableHeader';
import { SettingsRoleAssignmentWorkspaceMemberPickerDropdown } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentWorkspaceMemberPickerDropdown';
import { SettingsRoleAssignmentConfirmationModalSelectedWorkspaceMember } from '@/settings/roles/role-assignment/types/SettingsRoleAssignmentConfirmationModalSelectedWorkspaceMember';
import { settingsAllRolesSelector } from '@/settings/roles/states/settingsAllRolesSelector';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SettingsPath } from '@/types/SettingsPath';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  AppTooltip,
  H2Title,
  IconPlus,
  IconSearch,
  TooltipDelay,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { Role, WorkspaceMember } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { ROLE_ASSIGNMENT_CONFIRMATION_MODAL_ID } from '../constants/RoleAssignmentConfirmationModalId';
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

const StyledSearchInput = styled(SettingsTextInput)`
  input {
    background: ${({ theme }) => theme.background.transparent.lighter};
    border: 1px solid ${({ theme }) => theme.border.color.medium};
  }
`;

const StyledTable = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
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

  const { openModal, closeModal } = useModal();
  const [selectedWorkspaceMember, setSelectedWorkspaceMember] =
    useState<SettingsRoleAssignmentConfirmationModalSelectedWorkspaceMember | null>(
      null,
    );

  const dropdownId = 'role-member-select';

  const { closeDropdown } = useCloseDropdown();
  const [searchFilter, setSearchFilter] = useState('');
  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const settingsAllRoles = useRecoilValue(settingsAllRolesSelector);

  const workspaceMemberRoleMap = new Map<
    string,
    { id: string; label: string }
  >();
  settingsAllRoles.forEach((role: Role) => {
    role.workspaceMembers.forEach((member: WorkspaceMember) => {
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
    setSelectedWorkspaceMember(null);
  };

  const handleSelectWorkspaceMember = (
    workspaceMember: CurrentWorkspaceMember,
  ) => {
    const existingRole = workspaceMemberRoleMap.get(workspaceMember.id);

    setSelectedWorkspaceMember({
      id: workspaceMember.id,
      name: `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`,
      role: existingRole,
    });
    openModal(ROLE_ASSIGNMENT_CONFIRMATION_MODAL_ID);
    closeDropdown(dropdownId);
  };

  const isModalOpened = useRecoilComponentValue(
    isModalOpenedComponentState,
    ROLE_ASSIGNMENT_CONFIRMATION_MODAL_ID,
  );

  const handleConfirm = async () => {
    if (!selectedWorkspaceMember || !isModalOpened) return;

    if (!isCreateMode) {
      await addWorkspaceMemberToRoleAndUpdateState({
        workspaceMemberId: selectedWorkspaceMember.id,
      });
    } else {
      const workspaceMember = currentWorkspaceMembers.find(
        (member) => member.id === selectedWorkspaceMember.id,
      );

      if (!workspaceMember) {
        throw new Error('Workspace member not found');
      }

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
    closeModal(ROLE_ASSIGNMENT_CONFIRMATION_MODAL_ID);
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
            instanceId="role-assignment-member-search"
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
            dropdownOffset={{ x: 0, y: 4 }}
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
                  content={t`The workspace needs at least one Admin`}
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

      {selectedWorkspaceMember && (
        <SettingsRoleAssignmentConfirmationModal
          selectedWorkspaceMember={selectedWorkspaceMember}
          onClose={handleModalClose}
          onConfirm={handleConfirm}
          onRoleClick={handleRoleClick}
        />
      )}
    </>
  );
};
