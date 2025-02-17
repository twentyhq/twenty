import { t } from '@lingui/core/macro';
import { MenuItem, MenuItemAvatar } from 'twenty-ui';
import { WorkspaceMember } from '~/generated-metadata/graphql';

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
