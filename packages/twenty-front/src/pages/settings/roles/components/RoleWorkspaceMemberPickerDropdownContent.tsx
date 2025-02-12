import styled from '@emotion/styled';
import { MenuItemAvatar } from 'twenty-ui';
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

  // if (!filteredWorkspaceMembers?.length && searchFilter?.length > 0) {
  //   return (
  //     <StyledEmptyState>{t`No members matching this search`}</StyledEmptyState>
  //   );
  // }

  return (
    <>
      {filteredWorkspaceMembers.map((workspaceMember) => (
        <MenuItemAvatar
          key={workspaceMember.id}
          onClick={() => onSelect(workspaceMember)}
          avatar={{
            type: 'rounded',
            size: 'md',
            placeholder: workspaceMember.name.firstName ?? '',
            placeholderColorSeed: workspaceMember.id,
          }}
          text={`${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`}
        />
      ))}
    </>
  );
};
