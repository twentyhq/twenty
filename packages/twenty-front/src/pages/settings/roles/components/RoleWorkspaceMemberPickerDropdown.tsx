import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import styled from '@emotion/styled';
import { ChangeEvent, useState } from 'react';
import { WorkspaceMember } from '~/generated-metadata/graphql';
import { RoleWorkspaceMemberPickerDropdownContent } from './RoleWorkspaceMemberPickerDropdownContent';

const StyledWorkspaceMemberSelectContainer = styled.div`
  max-height: ${({ theme }) => theme.spacing(50)};
  overflow-y: auto;
`;

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
    <DropdownMenuItemsContainer>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={handleSearchFilterChange}
        placeholder="Search"
      />
      <StyledWorkspaceMemberSelectContainer>
        <RoleWorkspaceMemberPickerDropdownContent
          loading={loading}
          searchFilter={searchFilter}
          filteredWorkspaceMembers={filteredWorkspaceMembers}
          onSelect={onSelect}
        />
      </StyledWorkspaceMemberSelectContainer>
    </DropdownMenuItemsContainer>
  );
};
