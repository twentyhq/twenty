import { isServerAdminAccessAllowedFromWorkspace } from 'src/engine/core-modules/impersonation/utils/is-server-admin-access-allowed-from-workspace.util';

describe('isServerAdminAccessAllowedFromWorkspace', () => {
  it('should allow any workspace when no server admin workspace is configured', () => {
    expect(
      isServerAdminAccessAllowedFromWorkspace({
        workspaceId: 'workspace-id',
        serverAdminWorkspaceId: undefined,
      }),
    ).toBe(true);
  });

  it('should allow a request without workspace when no server admin workspace is configured', () => {
    expect(
      isServerAdminAccessAllowedFromWorkspace({
        workspaceId: undefined,
        serverAdminWorkspaceId: undefined,
      }),
    ).toBe(true);
  });

  it('should allow the configured server admin workspace', () => {
    expect(
      isServerAdminAccessAllowedFromWorkspace({
        workspaceId: 'server-admin-workspace-id',
        serverAdminWorkspaceId: 'server-admin-workspace-id',
      }),
    ).toBe(true);
  });

  it('should refuse another workspace', () => {
    expect(
      isServerAdminAccessAllowedFromWorkspace({
        workspaceId: 'workspace-id',
        serverAdminWorkspaceId: 'server-admin-workspace-id',
      }),
    ).toBe(false);
  });

  it('should refuse a request without workspace', () => {
    expect(
      isServerAdminAccessAllowedFromWorkspace({
        workspaceId: undefined,
        serverAdminWorkspaceId: 'server-admin-workspace-id',
      }),
    ).toBe(false);
  });
});
