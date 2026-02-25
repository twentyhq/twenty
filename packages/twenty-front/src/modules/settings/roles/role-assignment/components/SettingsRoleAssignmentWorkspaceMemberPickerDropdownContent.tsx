import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem, MenuItemAvatar } from 'twenty-ui/navigation';
import { type SearchRecord } from '~/generated/graphql';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type SettingsRoleAssignmentWorkspaceMemberPickerDropdownContentProps = {
  loading: boolean;
  searchFilter: string;
  filteredWorkspaceMembers: SearchRecord[];
  onSelect: (workspaceMember: PartialWorkspaceMember) => void;
};

export const SettingsRoleAssignmentWorkspaceMemberPickerDropdownContent = ({
  loading,
  searchFilter,
  filteredWorkspaceMembers,
  onSelect,
}: SettingsRoleAssignmentWorkspaceMemberPickerDropdownContentProps) => {
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

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
      {enrichedWorkspaceMembers.map((workspaceMember) => {
        const workspaceMemberFullName = `${workspaceMember?.name.firstName ?? ''} ${workspaceMember?.name.lastName ?? ''}`;

        return (
          <MenuItemAvatar
            key={workspaceMember.id}
            onClick={() => onSelect(workspaceMember)}
            avatar={{
              type: 'rounded',
              size: 'md',
              placeholder: workspaceMemberFullName,
              placeholderColorSeed: workspaceMember.id,
              avatarUrl: workspaceMember.avatarUrl,
            }}
            text={workspaceMemberFullName}
            contextualText={workspaceMember.userEmail}
          />
        );
      })}
    </>
  );
};
