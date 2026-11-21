import { beforeEach, describe, expect, it, vi } from 'vitest';

import { reconcileTeamsChatTenantClaims } from 'src/features/chat/logic-functions/utils/reconcile-teams-chat-tenant-claims';

const { listTeamsConnectionsMock, registerTeamsConnectionMock } = vi.hoisted(
  () => ({
    listTeamsConnectionsMock: vi.fn(),
    registerTeamsConnectionMock: vi.fn(),
  }),
);

vi.mock(
  'src/features/transcripts/logic-functions/utils/list-teams-connections',
  () => ({ listTeamsConnections: listTeamsConnectionsMock }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/register-teams-connection',
  () => ({ registerTeamsConnection: registerTeamsConnectionMock }),
);

const WORKSPACE_ID = 'this-workspace-id';
const TENANT_ID = 'tenant-id';

const PERSONAL_CONNECTION = {
  id: 'personal-connection',
  scope: 'USER',
  authFailedAt: null,
};

const WORKSPACE_CONNECTION = {
  id: 'workspace-connection',
  scope: 'WORKSPACE',
  authFailedAt: null,
};

const SECOND_WORKSPACE_CONNECTION = {
  id: 'second-workspace-connection',
  scope: 'WORKSPACE',
  authFailedAt: null,
};

const REJECTED_WORKSPACE_CONNECTION = {
  id: 'rejected-workspace-connection',
  scope: 'WORKSPACE',
  authFailedAt: '2026-10-01T00:00:00.000Z',
};

describe('reconcileTeamsChatTenantClaims', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    listTeamsConnectionsMock.mockResolvedValue([
      PERSONAL_CONNECTION,
      WORKSPACE_CONNECTION,
      REJECTED_WORKSPACE_CONNECTION,
    ]);
    registerTeamsConnectionMock.mockResolvedValue({
      claimedTenantId: TENANT_ID,
    });
  });

  it('should claim the tenant of each working workspace connection when chat is enabled', async () => {
    expect(
      await reconcileTeamsChatTenantClaims({
        isChatEnabled: true,
        workspaceId: WORKSPACE_ID,
      }),
    ).toEqual([
      {
        connectedAccountId: WORKSPACE_CONNECTION.id,
        status: 'CLAIMED',
        tenantId: TENANT_ID,
      },
    ]);
    expect(registerTeamsConnectionMock).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: WORKSPACE_CONNECTION.id,
      workspaceId: WORKSPACE_ID,
      isChatEnabled: true,
      shouldMatchDirectory: false,
    });
  });

  it('should give the same outcome when run again', async () => {
    const firstRun = await reconcileTeamsChatTenantClaims({
      isChatEnabled: true,
      workspaceId: WORKSPACE_ID,
    });

    expect(
      await reconcileTeamsChatTenantClaims({
        isChatEnabled: true,
        workspaceId: WORKSPACE_ID,
      }),
    ).toEqual(firstRun);
  });

  it('should report a tenant another workspace holds as a conflict', async () => {
    registerTeamsConnectionMock.mockResolvedValue({
      claimedTenantId: null,
      conflictingTenantId: TENANT_ID,
    });

    expect(
      await reconcileTeamsChatTenantClaims({
        isChatEnabled: true,
        workspaceId: WORKSPACE_ID,
      }),
    ).toEqual([
      {
        connectedAccountId: WORKSPACE_CONNECTION.id,
        status: 'CONFLICT',
        tenantId: TENANT_ID,
      },
    ]);
  });

  it('should keep going when one connection fails', async () => {
    listTeamsConnectionsMock.mockResolvedValue([
      WORKSPACE_CONNECTION,
      SECOND_WORKSPACE_CONNECTION,
    ]);
    registerTeamsConnectionMock.mockRejectedValueOnce(new Error('graph down'));

    expect(
      await reconcileTeamsChatTenantClaims({
        isChatEnabled: true,
        workspaceId: WORKSPACE_ID,
      }),
    ).toEqual([
      {
        connectedAccountId: WORKSPACE_CONNECTION.id,
        status: 'FAILED',
        error: 'graph down',
      },
      {
        connectedAccountId: SECOND_WORKSPACE_CONNECTION.id,
        status: 'CLAIMED',
        tenantId: TENANT_ID,
      },
    ]);
  });

  it('should release every connection when chat is disabled', async () => {
    registerTeamsConnectionMock
      .mockRejectedValueOnce(new Error('kv unavailable'))
      .mockResolvedValue({ claimedTenantId: null });

    expect(
      await reconcileTeamsChatTenantClaims({
        isChatEnabled: false,
        workspaceId: WORKSPACE_ID,
      }),
    ).toEqual([
      {
        connectedAccountId: PERSONAL_CONNECTION.id,
        status: 'FAILED',
        error: 'kv unavailable',
      },
      { connectedAccountId: WORKSPACE_CONNECTION.id, status: 'RELEASED' },
      {
        connectedAccountId: REJECTED_WORKSPACE_CONNECTION.id,
        status: 'RELEASED',
      },
    ]);
    expect(registerTeamsConnectionMock).toHaveBeenCalledTimes(3);
    expect(registerTeamsConnectionMock).toHaveBeenLastCalledWith({
      connectedAccountId: REJECTED_WORKSPACE_CONNECTION.id,
      workspaceId: WORKSPACE_ID,
      isChatEnabled: false,
      shouldMatchDirectory: false,
    });
  });

  it('should do nothing without a connection', async () => {
    listTeamsConnectionsMock.mockResolvedValue([]);

    expect(
      await reconcileTeamsChatTenantClaims({
        isChatEnabled: true,
        workspaceId: WORKSPACE_ID,
      }),
    ).toEqual([]);
    expect(registerTeamsConnectionMock).not.toHaveBeenCalled();
  });
});
