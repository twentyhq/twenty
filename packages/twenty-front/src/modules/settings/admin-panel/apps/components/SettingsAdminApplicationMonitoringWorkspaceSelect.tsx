import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { type AdminApplicationMonitoringWorkspace } from '@/settings/admin-panel/apps/types/AdminApplicationMonitoringWorkspace';
import { buildAdminApplicationMonitoringWorkspaceOptions } from '@/settings/admin-panel/apps/utils/buildAdminApplicationMonitoringWorkspaceOptions';
import { Select } from '@/ui/input/components/Select';

type SettingsAdminApplicationMonitoringWorkspaceSelectProps = {
  dropdownId: string;
  workspaces: AdminApplicationMonitoringWorkspace[];
  selectedWorkspace?: AdminApplicationMonitoringWorkspace;
  onChange: (workspace?: AdminApplicationMonitoringWorkspace) => void;
};

export const SettingsAdminApplicationMonitoringWorkspaceSelect = ({
  dropdownId,
  workspaces,
  selectedWorkspace,
  onChange,
}: SettingsAdminApplicationMonitoringWorkspaceSelectProps) => {
  const { t } = useLingui();

  const selectableWorkspaces = isDefined(selectedWorkspace)
    ? [selectedWorkspace, ...workspaces]
    : workspaces;

  return (
    <Select
      dropdownId={dropdownId}
      value={selectedWorkspace?.workspaceId ?? ''}
      options={buildAdminApplicationMonitoringWorkspaceOptions({
        allWorkspacesLabel: t`All workspaces`,
        workspaces,
        selectedWorkspace,
      })}
      onChange={(workspaceId) =>
        onChange(
          selectableWorkspaces.find(
            (workspace) => workspace.workspaceId === workspaceId,
          ),
        )
      }
      withSearchInput
      needIconCheck
      selectSizeVariant="small"
    />
  );
};
