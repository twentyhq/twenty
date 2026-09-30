import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildTeamsConnectedAccountTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-connected-account-tenant-kv-key';
import { buildTeamsTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-kv-key';
import { releaseTeamsConnectionTenant } from 'src/features/chat/logic-functions/utils/release-teams-connection-tenant';

const { kvStore, kvDeleteMock, listConnectionsMock } = vi.hoisted(() => ({
  kvStore: new Map<string, string>(),
  kvDeleteMock: vi.fn(),
  listConnectionsMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: {
    get: async (key: string) => kvStore.get(key) ?? null,
    delete: kvDeleteMock,
  },
  listConnections: listConnectionsMock,
}));

const TENANT_ID = 'tenant-id';

describe('releaseTeamsConnectionTenant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    kvStore.clear();
    kvStore.set(buildTeamsConnectedAccountTenantKvKey('leaving'), TENANT_ID);
    kvDeleteMock.mockResolvedValue(true);
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
    );
  });
});
