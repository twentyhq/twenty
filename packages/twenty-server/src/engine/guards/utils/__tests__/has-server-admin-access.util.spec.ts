import { hasServerAdminAccess } from 'src/engine/guards/utils/has-server-admin-access.util';

const SERVER_ADMIN_WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const OTHER_WORKSPACE_ID = '20202020-0000-4000-8000-000000000002';

const buildAuthContext = ({
  canAccessFullAdminPanel = false,
  canImpersonate = false,
  workspaceId = SERVER_ADMIN_WORKSPACE_ID,
  isImpersonating = false,
}: {
  canAccessFullAdminPanel?: boolean;
  canImpersonate?: boolean;
  workspaceId?: string;
  isImpersonating?: boolean;
}) => ({
  user: { canAccessFullAdminPanel, canImpersonate },
  workspace: { id: workspaceId },
  impersonationContext: isImpersonating
    ? {
        impersonatorUserWorkspaceId: 'impersonator-user-workspace-id',
        impersonatedUserWorkspaceId: 'impersonated-user-workspace-id',
      }
    : undefined,
});

describe('hasServerAdminAccess', () => {
  it('should grant a full admin in the server admin workspace', () => {
    expect(
      hasServerAdminAccess({
        authContext: buildAuthContext({ canAccessFullAdminPanel: true }),
        serverAdminWorkspaceId: SERVER_ADMIN_WORKSPACE_ID,
      }),
    ).toBe(true);
  });

  it('should grant a server impersonator in the server admin workspace', () => {
    expect(
      hasServerAdminAccess({
        authContext: buildAuthContext({ canImpersonate: true }),
        serverAdminWorkspaceId: SERVER_ADMIN_WORKSPACE_ID,
      }),
    ).toBe(true);
  });

  it('should refuse an admin outside the server admin workspace', () => {
    expect(
      hasServerAdminAccess({
        authContext: buildAuthContext({
          canAccessFullAdminPanel: true,
          workspaceId: OTHER_WORKSPACE_ID,
        }),
        serverAdminWorkspaceId: SERVER_ADMIN_WORKSPACE_ID,
      }),
    ).toBe(false);
  });

  it('should grant an admin in any workspace when no server admin workspace is set', () => {
    expect(
      hasServerAdminAccess({
        authContext: buildAuthContext({
          canAccessFullAdminPanel: true,
          workspaceId: OTHER_WORKSPACE_ID,
        }),
        serverAdminWorkspaceId: undefined,
      }),
    ).toBe(true);
  });

  it('should refuse a user without admin privileges', () => {
    expect(
      hasServerAdminAccess({
        authContext: buildAuthContext({}),
        serverAdminWorkspaceId: SERVER_ADMIN_WORKSPACE_ID,
      }),
    ).toBe(false);
  });

  it('should refuse an admin while impersonating', () => {
    expect(
      hasServerAdminAccess({
        authContext: buildAuthContext({
          canAccessFullAdminPanel: true,
          isImpersonating: true,
        }),
        serverAdminWorkspaceId: SERVER_ADMIN_WORKSPACE_ID,
      }),
    ).toBe(false);
  });

  it('should refuse an unauthenticated request', () => {
    expect(
      hasServerAdminAccess({
        authContext: {},
        serverAdminWorkspaceId: SERVER_ADMIN_WORKSPACE_ID,
      }),
    ).toBe(false);
  });
});
