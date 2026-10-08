import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildTeamsConnectedAccountTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-connected-account-tenant-kv-key';
import { buildTeamsTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-kv-key';
import { releaseTeamsConnectionTenant } from 'src/features/chat/logic-functions/utils/release-teams-connection-tenant';

const { kvStore, unreadableKvKeys, kvDeleteMock, listConnectionsMock } =
  vi.hoisted(() => ({
    kvStore: new Map<string, string | null>(),
    unreadableKvKeys: new Set<string>(),
    kvDeleteMock: vi.fn(),
    listConnectionsMock: vi.fn(),
  }));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: {
    get: async (key: string) => {
      if (unreadableKvKeys.has(key)) {
        throw new Error('kv unavailable');
      }

      return kvStore.get(key) ?? null;
    },
    set: async (key: string, value: string | null) => {
      kvStore.set(key, value);
    },
    delete: async (key: string, options?: { scope: string }) => {
      kvDeleteMock(key, options);

      return kvStore.delete(key);
    },
  },
  listConnections: listConnectionsMock,
}));

const TENANT_ID = 'tenant-id';

describe('releaseTeamsConnectionTenant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    kvStore.clear();
    unreadableKvKeys.clear();
    kvStore.set(buildTeamsConnectedAccountTenantKvKey('leaving'), TENANT_ID);
    kvStore.set(buildTeamsTenantKvKey(TENANT_ID), null);
    listConnectionsMock.mockResolvedValue([{ id: 'leaving' }]);
  });

  it('should release the tenant claim and forget the connection', async () => {
    expect(
      await releaseTeamsConnectionTenant({ connectedAccountId: 'leaving' }),
    ).toEqual({ releasedTenantId: TENANT_ID });
    expect(kvDeleteMock).toHaveBeenCalledWith(
      buildTeamsTenantKvKey(TENANT_ID),
      {
        scope: 'SERVER',
      },
    );
    expect(kvDeleteMock).toHaveBeenCalledWith(
      buildTeamsConnectedAccountTenantKvKey('leaving'),
      undefined,
    );
  });

  it('should keep the tenant claimed while another connection in the workspace still holds it', async () => {
    kvStore.set(buildTeamsConnectedAccountTenantKvKey('staying'), TENANT_ID);
    listConnectionsMock.mockResolvedValue([
      { id: 'leaving' },
      { id: 'staying' },
    ]);

    expect(
      await releaseTeamsConnectionTenant({ connectedAccountId: 'leaving' }),
    ).toEqual({ releasedTenantId: null });
    expect(kvDeleteMock).toHaveBeenCalledTimes(1);
    expect(kvDeleteMock).toHaveBeenCalledWith(
      buildTeamsConnectedAccountTenantKvKey('leaving'),
      undefined,
    );
  });

  it('should release the tenant when two connections holding it are released at the same time', async () => {
    kvStore.set(
      buildTeamsConnectedAccountTenantKvKey('also-leaving'),
      TENANT_ID,
    );
    listConnectionsMock.mockResolvedValue([
      { id: 'leaving' },
      { id: 'also-leaving' },
    ]);

    const results = await Promise.all([
      releaseTeamsConnectionTenant({ connectedAccountId: 'leaving' }),
      releaseTeamsConnectionTenant({ connectedAccountId: 'also-leaving' }),
    ]);

    expect(kvDeleteMock).toHaveBeenCalledWith(
      buildTeamsTenantKvKey(TENANT_ID),
      { scope: 'SERVER' },
    );
    expect(results.map((result) => result.releasedTenantId)).toContain(
      TENANT_ID,
    );
  });

  it('should keep the connection tenant for a retry when listing connections fails', async () => {
    listConnectionsMock.mockRejectedValue(new Error('refresh failed'));

    await expect(
      releaseTeamsConnectionTenant({ connectedAccountId: 'leaving' }),
    ).rejects.toThrow('refresh failed');
    expect(kvDeleteMock).not.toHaveBeenCalled();
  });

  it('should keep the connection tenant for a retry when reading other connections fails', async () => {
    unreadableKvKeys.add(buildTeamsConnectedAccountTenantKvKey('staying'));
    listConnectionsMock.mockResolvedValue([
      { id: 'leaving' },
      { id: 'staying' },
    ]);

    await expect(
      releaseTeamsConnectionTenant({ connectedAccountId: 'leaving' }),
    ).rejects.toThrow('kv unavailable');
    expect(kvStore.get(buildTeamsConnectedAccountTenantKvKey('leaving'))).toBe(
      TENANT_ID,
    );
    expect(kvStore.has(buildTeamsTenantKvKey(TENANT_ID))).toBe(true);
  });

  it('should claim the tenant again when a connection takes it while it is being released', async () => {
    kvStore.set(buildTeamsConnectedAccountTenantKvKey('joining'), TENANT_ID);
    listConnectionsMock
      .mockResolvedValueOnce([{ id: 'leaving' }])
      .mockResolvedValueOnce([{ id: 'leaving' }, { id: 'joining' }]);

    expect(
      await releaseTeamsConnectionTenant({ connectedAccountId: 'leaving' }),
    ).toEqual({ releasedTenantId: null });
    expect(kvStore.has(buildTeamsTenantKvKey(TENANT_ID))).toBe(true);
  });
});
