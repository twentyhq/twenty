import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';
import { SettingsPath } from '@/types/SettingsPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  AppTooltip,
  Button,
  H2Title,
  IconPlus,
  IconSearch,
  Section,
  TooltipDelay,
} from 'twenty-ui';
import { Role, WorkspaceMember } from '~/generated-metadata/graphql';
import {
  GetRolesDocument,
  useGetRolesQuery,
  useUpdateWorkspaceMemberRoleMutation,
} from '~/generated/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { RoleAssignmentConfirmationModalSelectedWorkspaceMember } from '~/pages/settings/roles/types/RoleAssignmentConfirmationModalSelectedWorkspaceMember';
import { RoleAssignmentConfirmationModal } from './RoleAssignmentConfirmationModal';
import { RoleAssignmentTableHeader } from './RoleAssignmentTableHeader';
import { RoleAssignmentTableRow } from './RoleAssignmentTableRow';
import { RoleWorkspaceMemberPickerDropdown } from './RoleWorkspaceMemberPickerDropdown';

const StyledBottomSection = styled(Section)<{ hasRows: boolean }>`
  ${({ hasRows, theme }) =>
    hasRows
      ? `
    border-top: 1px solid ${theme.border.color.light};
    margin-top: ${theme.spacing(2)};
    padding-top: ${theme.spacing(4)};
  `
      : `
    margin-top: ${theme.spacing(8)};
  `}
  display: flex;
  justify-content: flex-end;
`;

const StyledSearchContainer = styled.div`
  margin: ${({ theme }) => theme.spacing(2)} 0;
`;

const StyledSearchInput = styled(TextInput)`
  input {
    background: ${({ theme }) => theme.background.transparent.lighter};
    border: 1px solid ${({ theme }) => theme.border.color.medium};

    &:hover {
      border: 1px solid ${({ theme }) => theme.border.color.medium};
    }
  }
`;

type RoleAssignmentProps = {
  role: Pick<Role, 'id' | 'label' | 'canUpdateAllSettings'> & {
    workspaceMembers: Array<WorkspaceMember>;
  };
};

export const RoleAssignment = ({ role }: RoleAssignmentProps) => {
  const navigateSettings = useNavigateSettings();
  const [updateWorkspaceMemberRole] = useUpdateWorkspaceMemberRoleMutation({
    refetchQueries: [GetRolesDocument],
  });

  const [confirmationModalIsOpen, setConfirmationModalIsOpen] =
    useState<boolean>(false);
  const [selectedWorkspaceMember, setSelectedWorkspaceMember] =
    useState<RoleAssignmentConfirmationModalSelectedWorkspaceMember | null>(
      null,
    );
  const { data: rolesData } = useGetRolesQuery();
  const { closeDropdown } = useDropdown('role-member-select');
  const [searchFilter, setSearchFilter] = useState('');
  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);

  const workspaceMemberRoleMap = new Map<
    string,
    { id: string; label: string }
  >();
  rolesData?.getRoles?.forEach((role) => {
    role.workspaceMembers.forEach((member) => {
      workspaceMemberRoleMap.set(member.id, { id: role.id, label: role.label });
    });
  });

  const filteredWorkspaceMembers = !searchFilter
    ? role.workspaceMembers
    : role.workspaceMembers.filter((member) => {
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

  const handleModalClose = () => {
    setConfirmationModalIsOpen(false);
    setSelectedWorkspaceMember(null);
  };

  const handleSelectWorkspaceMember = (workspaceMember: WorkspaceMember) => {
    const existingRole = workspaceMemberRoleMap.get(workspaceMember.id);

    setSelectedWorkspaceMember({
      id: workspaceMember.id,
      name: `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`,
      role: existingRole,
    });
    setConfirmationModalIsOpen(true);
    closeDropdown();
  };

  const handleConfirm = async () => {
    if (!selectedWorkspaceMember || !confirmationModalIsOpen) return;

    await updateWorkspaceMemberRole({
      variables: {
        workspaceMemberId: selectedWorkspaceMember.id,
        roleId: role.id,
      },
    });

    handleModalClose();
  };

  const handleRoleClick = (roleId: string) => {
    navigateSettings(SettingsPath.RoleDetail, { roleId });
    handleModalClose();
  };

  const handleSearchChange = (text: string) => {
    setSearchFilter(text);
  };

  const allWorkspaceMembersHaveThisRole =
    role.workspaceMembers.length === currentWorkspaceMembers.length;

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
            placeholder={t`Search a member`}
            fullWidth
            LeftIcon={IconSearch}
            sizeVariant="lg"
          />
        </StyledSearchContainer>
        <Table>
          <RoleAssignmentTableHeader />
          {filteredWorkspaceMembers.map((workspaceMember) => (
            <RoleAssignmentTableRow
              key={workspaceMember.id}
              workspaceMember={workspaceMember}
            />
          ))}
        </Table>
      </Section>
      <StyledBottomSection hasRows={filteredWorkspaceMembers.length > 0}>
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
            <RoleWorkspaceMemberPickerDropdown
              excludedWorkspaceMemberIds={role.workspaceMembers.map(
                (workspaceMember) => workspaceMember.id,
              )}
              onSelect={handleSelectWorkspaceMember}
            />
          }
        />
      </StyledBottomSection>

      {confirmationModalIsOpen && selectedWorkspaceMember && (
        <RoleAssignmentConfirmationModal
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
