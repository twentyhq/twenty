import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { ChangeEvent, useState } from 'react';
import { Avatar } from 'twenty-ui';
import { WorkspaceMember } from '~/generated-metadata/graphql';

const StyledWorkspaceMemberSelectContainer = styled.div`
  max-height: ${({ theme }) => theme.spacing(50)};
  overflow-y: auto;
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: flex-start;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledWorkspaceMemberItem = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: ${({ theme }) => theme.spacing(45)};
  padding: ${({ theme }) => theme.spacing(2)};

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledWorkspaceMemberName = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledSearchInput = styled(DropdownMenuSearchInput)`
  margin: 0;
  padding: ${({ theme }) => theme.spacing(1)};
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

  const renderContent = () => {
    if (loading) {
      return null;
    }

    if (!filteredWorkspaceMembers?.length) {
      return (
        <StyledEmptyState>
          {searchFilter
            ? t`No members matching this search`
            : t`No more members to add`}
        </StyledEmptyState>
      );
    }

    return filteredWorkspaceMembers.map((workspaceMember) => (
      <StyledWorkspaceMemberItem
        key={workspaceMember.id}
        onClick={() => onSelect(workspaceMember)}
        aria-label={`${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`}
      >
        <Avatar
          type="rounded"
          size="md"
          placeholderColorSeed={workspaceMember.id}
          placeholder={workspaceMember.name.firstName ?? ''}
        />
        <StyledWorkspaceMemberName>
          {workspaceMember.name.firstName} {workspaceMember.name.lastName}
        </StyledWorkspaceMemberName>
      </StyledWorkspaceMemberItem>
    ));
  };

  return (
    <DropdownMenuItemsContainer>
      <StyledSearchInput
        value={searchFilter}
        onChange={handleSearchFilterChange}
        placeholder={t`Search`}
      />
      <StyledWorkspaceMemberSelectContainer>
        {renderContent()}
      </StyledWorkspaceMemberSelectContainer>
    </DropdownMenuItemsContainer>
  );
};
