import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { ChangeEvent, useState } from 'react';
import { WorkspaceMember } from '~/generated-metadata/graphql';
import { RoleWorkspaceMemberPickerDropdownContent } from './RoleWorkspaceMemberPickerDropdownContent';

type RoleWorkspaceMemberPickerDropdownProps = {
  excludedWorkspaceMemberIds: string[];
  onSelect: (workspaceMember: WorkspaceMember) => void;
};

export const RoleWorkspaceMemberPickerDropdown = ({
  excludedWorkspaceMemberIds,
  onSelect,
}: RoleWorkspaceMemberPickerDropdownProps) => {
  const [searchFilter, setSearchFilter] = useState('');

  const { records: workspaceMembers, loading } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    filter: searchFilter
      ? {
          or: [
            {
              name: { firstName: { ilike: `%${searchFilter}%` } },
            },
            {
              name: { lastName: { ilike: `%${searchFilter}%` } },
            },
            {
              userEmail: { ilike: `%${searchFilter}%` },
            },
          ],
        }
      : undefined,
  });

  const filteredWorkspaceMembers = (workspaceMembers?.filter(
    (workspaceMember) =>
      !excludedWorkspaceMemberIds.includes(workspaceMember.id),
  ) ?? []) as WorkspaceMember[];

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
      <DropdownMenuItemsContainer>
        <RoleWorkspaceMemberPickerDropdownContent
          loading={loading}
          searchFilter={searchFilter}
          filteredWorkspaceMembers={filteredWorkspaceMembers}
          onSelect={onSelect}
        />
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  );
};
