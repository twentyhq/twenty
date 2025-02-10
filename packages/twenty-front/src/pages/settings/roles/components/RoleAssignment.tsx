import { SettingsPath } from '@/types/SettingsPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { Button, H2Title, IconPlus, IconSearch, Section } from 'twenty-ui';
import { Role, WorkspaceMember } from '~/generated-metadata/graphql';
import {
  GetRolesDocument,
  useGetRolesQuery,
  useUpdateWorkspaceMemberRoleMutation,
} from '~/generated/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import {
  ModalMode,
  RoleAssignmentModal,
  SelectedWorkspaceMember,
} from './RoleAssignmentModal';
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

const StyledEmptyText = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing(4)};
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

  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [selectedWorkspaceMember, setSelectedWorkspaceMember] =
    useState<SelectedWorkspaceMember | null>(null);
  const { data: rolesData } = useGetRolesQuery();
  const { closeDropdown } = useDropdown('role-member-select');
  const [searchFilter, setSearchFilter] = useState('');

  const workspaceMemberRoleMap = useMemo(() => {
    if (!rolesData?.getRoles) return new Map();

    const roleMap = new Map<string, { id: string; label: string }>();
    rolesData.getRoles.forEach((role) => {
      role.workspaceMembers.forEach((member) => {
        roleMap.set(member.id, { id: role.id, label: role.label });
      });
    });
    return roleMap;
  }, [rolesData?.getRoles]);

  const filteredWorkspaceMembers = useMemo(() => {
    if (!searchFilter) return role.workspaceMembers;

    const searchTerm = searchFilter.toLowerCase();
    return role.workspaceMembers.filter((member) => {
      const firstName = member.name.firstName?.toLowerCase() || '';
      const lastName = member.name.lastName?.toLowerCase() || '';
      const email = member.userEmail?.toLowerCase() || '';

      return (
        firstName.includes(searchTerm) ||
        lastName.includes(searchTerm) ||
        email.includes(searchTerm)
      );
    });
  }, [role.workspaceMembers, searchFilter]);

  const handleModalClose = () => {
    setModalMode(null);
    setSelectedWorkspaceMember(null);
  };

  const handleSelectWorkspaceMember = (workspaceMember: WorkspaceMember) => {
    const existingRole = workspaceMemberRoleMap.get(workspaceMember.id);

    setSelectedWorkspaceMember({
      id: workspaceMember.id,
      name: `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`,
      role: existingRole,
    });
    setModalMode('assign');
    closeDropdown();
  };

  const handleRemoveClick = (workspaceMember: WorkspaceMember) => {
    setSelectedWorkspaceMember({
      id: workspaceMember.id,
      name: `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`,
      role: workspaceMemberRoleMap.get(workspaceMember.id),
    });
    setModalMode('remove');
  };

  const handleConfirm = async () => {
    if (!selectedWorkspaceMember || !modalMode) return;

    await updateWorkspaceMemberRole({
      variables: {
        workspaceMemberId: selectedWorkspaceMember.id,
        roleId: modalMode === 'assign' ? role.id : null,
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
              onRemove={() => handleRemoveClick(workspaceMember)}
            />
          ))}
          {filteredWorkspaceMembers.length === 0 && (
            <StyledEmptyText>
              {searchFilter
                ? t`No members matching your search`
                : t`No members assigned to this role yet`}
            </StyledEmptyText>
          )}
        </Table>
      </Section>
      <StyledBottomSection hasRows={filteredWorkspaceMembers.length > 0}>
        <Dropdown
          dropdownId="role-member-select"
          dropdownHotkeyScope={{ scope: 'roleAssignment' }}
          clickableComponent={
            <Button
              Icon={IconPlus}
              title={t`Assign to member`}
              variant="secondary"
              size="small"
            />
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

      {modalMode && selectedWorkspaceMember && (
        <RoleAssignmentModal
          mode={modalMode}
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
