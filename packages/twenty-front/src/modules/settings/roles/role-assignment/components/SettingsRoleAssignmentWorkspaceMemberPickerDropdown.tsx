import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { SettingsRoleAssignmentWorkspaceMemberPickerDropdownContent } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentWorkspaceMemberPickerDropdownContent';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { type ChangeEvent, useState } from 'react';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

type SettingsRoleAssignmentWorkspaceMemberPickerDropdownProps = {
  excludedWorkspaceMemberIds: string[];
  onSelect: (workspaceMember: PartialWorkspaceMember) => void;
};

export const SettingsRoleAssignmentWorkspaceMemberPickerDropdown = ({
  excludedWorkspaceMemberIds,
  onSelect,
}: SettingsRoleAssignmentWorkspaceMemberPickerDropdownProps) => {
  const [searchFilter, setSearchFilter] = useState('');

  const { loading, searchRecords: workspaceMembers } =
    useObjectRecordSearchRecords({
      objectNameSingulars: [CoreObjectNameSingular.WorkspaceMember],
      searchInput: searchFilter,
    });

  const filteredWorkspaceMembers =
    workspaceMembers?.filter(
      (workspaceMember) =>
        !excludedWorkspaceMemberIds.includes(workspaceMember.recordId),
    ) ?? [];

  const handleSearchFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value);
  };
  const { t } = useLingui();

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={handleSearchFilterChange}
        placeholder={t`Search`}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        <SettingsRoleAssignmentWorkspaceMemberPickerDropdownContent
          loading={loading}
          searchFilter={searchFilter}
          filteredWorkspaceMembers={filteredWorkspaceMembers}
          onSelect={onSelect}
        />
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
