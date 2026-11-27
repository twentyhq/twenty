import { isServerAdminWorkspace } from 'src/engine/core-modules/impersonation/utils/is-server-admin-workspace.util';

describe('isServerAdminWorkspace', () => {
  it('should be true for the configured workspace', () => {
    expect(
      isServerAdminWorkspace({
        workspaceId: 'server-admin-workspace-id',
        serverAdminWorkspaceId: 'server-admin-workspace-id',
      }),
    ).toBe(true);
  });

  it('should be true when the configured id is written in uppercase', () => {
    expect(
      isServerAdminWorkspace({
        workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        serverAdminWorkspaceId: '20202020-1C25-4D02-BF25-6AECCF7EA419',
      }),
    ).toBe(true);
  });

  it('should be false for another workspace', () => {
    expect(
      isServerAdminWorkspace({
        workspaceId: 'workspace-id',
        serverAdminWorkspaceId: 'server-admin-workspace-id',
      }),
    ).toBe(false);
  });

  it('should be false without a workspace', () => {
    expect(
      isServerAdminWorkspace({
        workspaceId: undefined,
        serverAdminWorkspaceId: 'server-admin-workspace-id',
      }),
    ).toBe(false);
  });
});
