import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/primitives/input';

import { type AdminApplicationMonitoringWorkspace } from '@/settings/admin-panel/apps/types/AdminApplicationMonitoringWorkspace';
import { getAdminApplicationMonitoringWorkspaceLabel } from '@/settings/admin-panel/apps/utils/getAdminApplicationMonitoringWorkspaceLabel';

export const buildAdminApplicationMonitoringWorkspaceOptions = ({
  allWorkspacesLabel,
  workspaces,
  selectedWorkspace,
}: {
  allWorkspacesLabel: string;
  workspaces: AdminApplicationMonitoringWorkspace[];
  selectedWorkspace?: AdminApplicationMonitoringWorkspace;
}): SelectOption<string>[] => {
  const isSelectedWorkspaceListed = workspaces.some(
    (workspace) => workspace.workspaceId === selectedWorkspace?.workspaceId,
  );

  const listedWorkspaces =
    isDefined(selectedWorkspace) && !isSelectedWorkspaceListed
      ? [selectedWorkspace, ...workspaces]
      : workspaces;

  return [
    { value: '', label: allWorkspacesLabel },
    ...listedWorkspaces.map((workspace) => ({
      value: workspace.workspaceId,
      label: getAdminApplicationMonitoringWorkspaceLabel(workspace),
    })),
  ];
};
