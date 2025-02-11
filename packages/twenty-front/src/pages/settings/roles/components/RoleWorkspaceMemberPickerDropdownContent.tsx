import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Avatar } from 'twenty-ui';
import { WorkspaceMember } from '~/generated-metadata/graphql';

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

type RoleWorkspaceMemberPickerDropdownContentProps = {
  loading: boolean;
  searchFilter: string;
  filteredWorkspaceMembers: WorkspaceMember[];
  onSelect: (workspaceMember: WorkspaceMember) => void;
};

export const RoleWorkspaceMemberPickerDropdownContent = ({
  loading,
  searchFilter,
  filteredWorkspaceMembers,
  onSelect,
}: RoleWorkspaceMemberPickerDropdownContentProps) => {
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

  return (
    <>
      {filteredWorkspaceMembers.map((workspaceMember) => (
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
      ))}
    </>
  );
};
