import { MenuItemAvatar } from 'twenty-ui';
import { WorkspaceMember } from '~/generated-metadata/graphql';

type RoleWorkspaceMemberPickerDropdownContentProps = {
  loading: boolean;
  filteredWorkspaceMembers: WorkspaceMember[];
  onSelect: (workspaceMember: WorkspaceMember) => void;
};

export const RoleWorkspaceMemberPickerDropdownContent = ({
  loading,
  filteredWorkspaceMembers,
  onSelect,
}: RoleWorkspaceMemberPickerDropdownContentProps) => {
  if (loading) {
    return null;
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
