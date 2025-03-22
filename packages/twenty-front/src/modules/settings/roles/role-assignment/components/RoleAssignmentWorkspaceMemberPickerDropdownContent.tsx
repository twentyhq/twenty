import { t } from '@lingui/core/macro';
import { MenuItem, MenuItemAvatar } from 'twenty-ui';
import { GlobalSearchRecord } from '~/generated-metadata/graphql';

type RoleAssignmentWorkspaceMemberPickerDropdownContentProps = {
  loading: boolean;
  searchFilter: string;
  filteredWorkspaceMembers: GlobalSearchRecord[];
  onSelect: (workspaceMemberSearchRecord: GlobalSearchRecord) => void;
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
          key={workspaceMember.recordId}
          onClick={() => onSelect(workspaceMember)}
          avatar={{
            type: 'rounded',
            size: 'md',
            placeholder: workspaceMember.label ?? '',
            placeholderColorSeed: workspaceMember.recordId,
          }}
          text={workspaceMember.label}
        />
      ))}
    </>
  );
};
