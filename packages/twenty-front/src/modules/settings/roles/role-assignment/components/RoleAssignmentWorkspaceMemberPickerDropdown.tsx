import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { RoleAssignmentWorkspaceMemberPickerDropdownContent } from '@/settings/roles/role-assignment/components/RoleAssignmentWorkspaceMemberPickerDropdownContent';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { ChangeEvent, useState } from 'react';
import { GlobalSearchRecord } from '~/generated-metadata/graphql';

type RoleAssignmentWorkspaceMemberPickerDropdownProps = {
  excludedWorkspaceMemberIds: string[];
  onSelect: (workspaceMemberSearchRecord: GlobalSearchRecord) => void;
};

export const RoleAssignmentWorkspaceMemberPickerDropdown = ({
  excludedWorkspaceMemberIds,
  onSelect,
}: RoleAssignmentWorkspaceMemberPickerDropdownProps) => {
  const [searchFilter, setSearchFilter] = useState('');

  const { loading, searchRecords: workspaceMembers } =
    useObjectRecordSearchRecords({
      objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
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

  return (
    <DropdownMenu>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={handleSearchFilterChange}
        placeholder="Search"
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        <RoleAssignmentWorkspaceMemberPickerDropdownContent
          loading={loading}
          searchFilter={searchFilter}
          filteredWorkspaceMembers={filteredWorkspaceMembers}
          onSelect={onSelect}
        />
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  );
};
