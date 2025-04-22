import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { SettingsRoleAssignmentWorkspaceMemberPickerDropdownContent } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentWorkspaceMemberPickerDropdownContent';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useLingui } from '@lingui/react/macro';
import { ChangeEvent, useState } from 'react';
import { SearchRecord } from '~/generated-metadata/graphql';

type SettingsRoleAssignmentWorkspaceMemberPickerDropdownProps = {
  excludedWorkspaceMemberIds: string[];
  onSelect: (workspaceMemberSearchRecord: SearchRecord) => void;
};

export const SettingsRoleAssignmentWorkspaceMemberPickerDropdown = ({
  excludedWorkspaceMemberIds,
  onSelect,
}: SettingsRoleAssignmentWorkspaceMemberPickerDropdownProps) => {
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
  const { t } = useLingui();

  return (
    <DropdownMenu>
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
    </DropdownMenu>
  );
};
