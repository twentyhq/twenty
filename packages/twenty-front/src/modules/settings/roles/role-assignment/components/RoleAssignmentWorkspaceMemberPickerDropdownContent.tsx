import { t } from '@lingui/core/macro';
import { MenuItem, MenuItemAvatar } from 'twenty-ui';
import { WorkspaceMember } from '~/generated-metadata/graphql';

type RoleAssignmentWorkspaceMemberPickerDropdownContentProps = {
  loading: boolean;
  searchFilter: string;
  filteredWorkspaceMembers: WorkspaceMember[];
  onSelect: (workspaceMember: WorkspaceMember) => void;
};

export const RoleAssignmentWorkspaceMemberPickerDropdownContent = ({
  loading,
  searchFilter,
  filteredWorkspaceMembers,
  onSelect,
}: RoleAssignmentWorkspaceMemberPickerDropdownContentProps) => {
  if (loading) {
    return null;
  }

  if (!filteredWorkspaceMembers.length && searchFilter.length > 0) {
    return <MenuItem disabled text={t`No Results`} />;
  }

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
