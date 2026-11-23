import { beforeEach, describe, expect, it, vi } from 'vitest';

import { claimTeamsTenantsOfExistingConnections } from 'src/features/chat/logic-functions/utils/claim-teams-tenants-of-existing-connections';

const { listTeamsConnectionsMock, registerMock, fetchWorkspaceIdMock } =
  vi.hoisted(() => ({
    listTeamsConnectionsMock: vi.fn(),
    registerMock: vi.fn(),
    fetchWorkspaceIdMock: vi.fn(),
  }));

vi.mock(
  'src/features/transcripts/logic-functions/utils/list-teams-connections',
  () => ({ listTeamsConnections: listTeamsConnectionsMock }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/register-teams-connection',
  () => ({ registerTeamsConnection: registerMock }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/fetch-current-workspace-id-or-throw',
  () => ({ fetchCurrentWorkspaceIdOrThrow: fetchWorkspaceIdMock }),
);

const WORKSPACE_CONNECTION = { id: 'workspace-connection', scope: 'WORKSPACE' };
const SECOND_WORKSPACE_CONNECTION = {
  id: 'second-workspace-connection',
  scope: 'WORKSPACE',
};

describe('claimTeamsTenantsOfExistingConnections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchWorkspaceIdMock.mockResolvedValue('workspace-id');
    registerMock.mockResolvedValue({ claimedTenantId: 'tenant-id' });
  });

  it('should claim the tenant of each working workspace connection, without the directory scan', async () => {
    listTeamsConnectionsMock.mockResolvedValue([
      WORKSPACE_CONNECTION,
      { id: 'personal-connection', scope: 'USER' },
      {
        id: 'failed-connection',
        scope: 'WORKSPACE',
        authFailedAt: '2026-01-01T00:00:00Z',
      },
    ]);

    await expect(claimTeamsTenantsOfExistingConnections()).resolves.toEqual({
      claimedConnectionCount: 1,
      conflictingConnectionCount: 0,
      failedConnectionCount: 0,
    });
    expect(registerMock).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: WORKSPACE_CONNECTION.id,
      workspaceId: 'workspace-id',
      shouldMatchDirectory: false,
    });
  });

  it('should do nothing when the workspace has no workspace connection', async () => {
    listTeamsConnectionsMock.mockResolvedValue([]);

    await expect(claimTeamsTenantsOfExistingConnections()).resolves.toEqual({
      claimedConnectionCount: 0,
      conflictingConnectionCount: 0,
      failedConnectionCount: 0,
    });
    expect(fetchWorkspaceIdMock).not.toHaveBeenCalled();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('should count a tenant another workspace holds as a conflict', async () => {
    listTeamsConnectionsMock.mockResolvedValue([WORKSPACE_CONNECTION]);
    registerMock.mockResolvedValue({
      claimedTenantId: null,
      conflictingTenantId: 'tenant-id',
    });

    await expect(
      claimTeamsTenantsOfExistingConnections(),
    ).resolves.toMatchObject({
      claimedConnectionCount: 0,
      conflictingConnectionCount: 1,
    });
  });

  it('should keep going when one connection cannot be claimed', async () => {
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    listTeamsConnectionsMock.mockResolvedValue([
      WORKSPACE_CONNECTION,
      SECOND_WORKSPACE_CONNECTION,
    ]);
    registerMock
      .mockRejectedValueOnce(new Error('graph down'))
      .mockResolvedValueOnce({ claimedTenantId: 'tenant-id' });

    await expect(claimTeamsTenantsOfExistingConnections()).resolves.toEqual({
      claimedConnectionCount: 1,
      conflictingConnectionCount: 0,
      failedConnectionCount: 1,
    });
    expect(registerMock).toHaveBeenCalledTimes(2);

    warnSpy.mockRestore();
  });
});
