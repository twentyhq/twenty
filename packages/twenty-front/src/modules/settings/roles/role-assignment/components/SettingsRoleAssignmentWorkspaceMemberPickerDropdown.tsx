import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { type SearchRecord } from '~/generated/graphql';
import { SettingsRoleAssignmentWorkspaceMemberPickerDropdownContent } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentWorkspaceMemberPickerDropdownContent';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { type ChangeEvent, useState } from 'react';

type SettingsRoleAssignmentWorkspaceMemberPickerDropdownProps = {
  excludedWorkspaceMemberIds: string[];
  onSelect: (workspaceMember: PartialWorkspaceMember) => void;
};

export const SettingsRoleAssignmentWorkspaceMemberPickerDropdown = ({
  excludedWorkspaceMemberIds,
  onSelect,
}: SettingsRoleAssignmentWorkspaceMemberPickerDropdownProps) => {
  const [searchFilter, setSearchFilter] = useState('');

  const { loading, searchRecords: workspaceMembers } =
    useObjectRecordSearchRecords({
      objectNameSingulars: [CoreObjectNameSingular.WorkspaceMember],
      searchInput: searchFilter,
    });

  const filteredWorkspaceMembers =
    workspaceMembers?.filter(
      (
        workspaceMember,
      ): workspaceMember is NonNullable<typeof workspaceMember> & {
        recordId: string;
      } =>
        !!workspaceMember?.recordId &&
        !excludedWorkspaceMemberIds.includes(workspaceMember.recordId),
    ) ?? [];

  const handleSearchFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value);
  };
  const { t } = useLingui();

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={handleSearchFilterChange}
        placeholder={t`Search`}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        <SettingsRoleAssignmentWorkspaceMemberPickerDropdownContent
          loading={loading}
          searchFilter={searchFilter}
          filteredWorkspaceMembers={filteredWorkspaceMembers as SearchRecord[]}
          onSelect={onSelect}
        />
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
