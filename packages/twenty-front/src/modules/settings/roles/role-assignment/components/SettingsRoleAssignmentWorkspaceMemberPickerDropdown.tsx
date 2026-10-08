import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { type SearchRecord } from '~/generated/graphql';
import { SettingsRoleAssignmentWorkspaceMemberPickerDropdownContent } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentWorkspaceMemberPickerDropdownContent';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';

type SettingsRoleAssignmentWorkspaceMemberPickerDropdownProps = {
  excludedWorkspaceMemberIds: string[];
  onSelect: (workspaceMember: PartialWorkspaceMember) => void;
};

export const SettingsRoleAssignmentWorkspaceMemberPickerDropdown = ({
  excludedWorkspaceMemberIds,
  onSelect,
}: SettingsRoleAssignmentWorkspaceMemberPickerDropdownProps) => {
  const [searchFilter, setSearchFilter] = useState('');

  const {
    loading,
    searchRecords: workspaceMembers,
    error,
  } = useObjectRecordSearchRecords({
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

  const { t } = useLingui();

  return (
    <>
      <ToastOnQueryErrorEffect error={error} />
      <Dropdown.Search
        value={searchFilter}
        onValueChange={setSearchFilter}
        placeholder={t`Search`}
        aria-label={t`Search`}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable>
        <SettingsRoleAssignmentWorkspaceMemberPickerDropdownContent
          loading={loading}
          searchFilter={searchFilter}
          filteredWorkspaceMembers={filteredWorkspaceMembers as SearchRecord[]}
          onSelect={onSelect}
        />
      </Dropdown.Section>
    </>
  );
};
