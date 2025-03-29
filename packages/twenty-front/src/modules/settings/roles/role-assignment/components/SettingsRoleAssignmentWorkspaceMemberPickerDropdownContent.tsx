import { t } from '@lingui/core/macro';
import { MenuItem, MenuItemAvatar } from 'twenty-ui';
import { SearchRecord } from '~/generated-metadata/graphql';

type SettingsRoleAssignmentWorkspaceMemberPickerDropdownContentProps = {
  loading: boolean;
  searchFilter: string;
  filteredWorkspaceMembers: SearchRecord[];
  onSelect: (workspaceMemberSearchRecord: SearchRecord) => void;
};

export const SettingsRoleAssignmentWorkspaceMemberPickerDropdownContent = ({
  loading,
  searchFilter,
  filteredWorkspaceMembers,
  onSelect,
}: SettingsRoleAssignmentWorkspaceMemberPickerDropdownContentProps) => {
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
