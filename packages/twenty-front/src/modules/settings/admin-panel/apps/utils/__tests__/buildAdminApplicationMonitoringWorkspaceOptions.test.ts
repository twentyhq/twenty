import { buildAdminApplicationMonitoringWorkspaceOptions } from '@/settings/admin-panel/apps/utils/buildAdminApplicationMonitoringWorkspaceOptions';

const APPLE = { workspaceId: 'workspace-apple', workspaceName: 'Apple' };
const YCOMBINATOR = {
  workspaceId: 'workspace-ycombinator',
  workspaceName: 'YCombinator',
};

describe('buildAdminApplicationMonitoringWorkspaceOptions', () => {
  it('should list every workspace after the all workspaces option', () => {
    expect(
      buildAdminApplicationMonitoringWorkspaceOptions({
        allWorkspacesLabel: 'All workspaces',
        workspaces: [
          APPLE,
          { workspaceId: 'workspace-deleted', workspaceName: null },
        ],
      }),
    ).toEqual([
      { value: '', label: 'All workspaces' },
      { value: 'workspace-apple', label: 'Apple' },
      { value: 'workspace-deleted', label: 'workspace-deleted' },
    ]);
  });

  it('should keep the selected workspace when it is not listed', () => {
    expect(
      buildAdminApplicationMonitoringWorkspaceOptions({
        allWorkspacesLabel: 'All workspaces',
        workspaces: [APPLE],
        selectedWorkspace: YCOMBINATOR,
      }).map(({ value }) => value),
    ).toEqual(['', 'workspace-ycombinator', 'workspace-apple']);
  });
});
