import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';
import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem, MenuItemAvatar } from 'twenty-ui/navigation';
import { SearchRecord } from '~/generated-metadata/graphql';

type SettingsRoleAssignmentWorkspaceMemberPickerDropdownContentProps = {
  loading: boolean;
  searchFilter: string;
  filteredWorkspaceMembers: SearchRecord[];
  onSelect: (workspaceMember: CurrentWorkspaceMember) => void;
};

export const SettingsRoleAssignmentWorkspaceMemberPickerDropdownContent = ({
  loading,
  searchFilter,
  filteredWorkspaceMembers,
  onSelect,
}: SettingsRoleAssignmentWorkspaceMemberPickerDropdownContentProps) => {
  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);

  if (loading) {
    return null;
  }

  if (!filteredWorkspaceMembers.length && searchFilter.length > 0) {
    return <MenuItem disabled text={t`No Results`} />;
  }

  const enrichedWorkspaceMembers = filteredWorkspaceMembers
    .map((workspaceMember) =>
      currentWorkspaceMembers.find(
        (member) => member.id === workspaceMember.recordId,
      ),
    )
    .filter(isDefined);

  return (
    <>
      {enrichedWorkspaceMembers.map((workspaceMember) => (
        <MenuItemAvatar
          key={workspaceMember.id}
          onClick={() => onSelect(workspaceMember)}
          avatar={{
            type: 'rounded',
            size: 'md',
            placeholder: workspaceMember?.name.firstName ?? '',
            placeholderColorSeed: workspaceMember?.id,
            avatarUrl: workspaceMember?.avatarUrl,
          }}
          text={workspaceMember?.name.firstName ?? ''}
        />
      ))}
    </>
  );
};
