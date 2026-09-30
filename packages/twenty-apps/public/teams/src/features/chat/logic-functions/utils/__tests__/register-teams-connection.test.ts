import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { buildTeamsConnectedAccountTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-connected-account-tenant-kv-key';
import { buildTeamsTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-kv-key';
import { registerTeamsConnection } from 'src/features/chat/logic-functions/utils/register-teams-connection';

const {
  featureFlags,
  kvGetMock,
  kvSetMock,
  getConnectionMock,
  fetchGraphJsonMock,
  releaseMock,
} = vi.hoisted(() => ({
  featureFlags: { IS_CHAT_ASSISTANT_ENABLED: true },
  kvGetMock: vi.fn(),
  kvSetMock: vi.fn(),
  getConnectionMock: vi.fn(),
  fetchGraphJsonMock: vi.fn(),
  releaseMock: vi.fn(),
}));

vi.mock('src/constants/feature-flags', () => ({
  FEATURE_FLAGS: featureFlags,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock, set: kvSetMock },
  getConnection: getConnectionMock,
}));

vi.mock(
  'src/features/transcripts/logic-functions/utils/fetch-graph-json',
  () => ({ fetchGraphJson: fetchGraphJsonMock }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/release-teams-connection-tenant',
  () => ({ releaseTeamsConnectionTenant: releaseMock }),
);

const CONNECTED_ACCOUNT_ID = 'connected-account-id';
const TENANT_ID = 'tenant-id';

describe('registerTeamsConnection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    featureFlags.IS_CHAT_ASSISTANT_ENABLED = true;
    process.env[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';
    getConnectionMock.mockResolvedValue({
      visibility: 'workspace',
      accessToken: 'graph-token',
    });
    fetchGraphJsonMock.mockResolvedValue({ value: [{ id: TENANT_ID }] });
    kvGetMock.mockResolvedValue(null);
  });

  it('should claim the tenant of a workspace-shared connection and remember it for release', async () => {
    expect(
      await registerTeamsConnection({
        connectedAccountId: CONNECTED_ACCOUNT_ID,
      }),
    ).toEqual({ claimedTenantId: TENANT_ID });
    expect(fetchGraphJsonMock).toHaveBeenCalledWith({
      accessToken: 'graph-token',
      url: 'organization?$select=id',
    });
    expect(kvSetMock).toHaveBeenNthCalledWith(
      1,
      buildTeamsConnectedAccountTenantKvKey(CONNECTED_ACCOUNT_ID),
      TENANT_ID,
    );
    expect(kvSetMock).toHaveBeenNthCalledWith(
      2,
      buildTeamsTenantKvKey(TENANT_ID),
      null,
      { scope: 'SERVER' },
    );
  });

  it('should release the previous tenant when a reconnect signs in to another tenant', async () => {
    kvGetMock.mockResolvedValue('previous-tenant-id');

    expect(
      await registerTeamsConnection({
        connectedAccountId: CONNECTED_ACCOUNT_ID,
      }),
    ).toEqual({ claimedTenantId: TENANT_ID });
    expect(releaseMock).toHaveBeenCalledWith({
      connectedAccountId: CONNECTED_ACCOUNT_ID,
    });
    expect(releaseMock.mock.invocationCallOrder[0]).toBeLessThan(
      kvSetMock.mock.invocationCallOrder[0],
    );
  });

  it('should keep the claim when a reconnect stays in the same tenant', async () => {
    kvGetMock.mockResolvedValue(TENANT_ID);

    await registerTeamsConnection({ connectedAccountId: CONNECTED_ACCOUNT_ID });

    expect(releaseMock).not.toHaveBeenCalled();
  });

  it('should leave personal connections alone', async () => {
    getConnectionMock.mockResolvedValue({
      visibility: 'user',
      accessToken: 'graph-token',
    });

    expect(
      await registerTeamsConnection({
        connectedAccountId: CONNECTED_ACCOUNT_ID,
      }),
    ).toEqual({ claimedTenantId: null });
    expect(fetchGraphJsonMock).not.toHaveBeenCalled();
    expect(kvSetMock).not.toHaveBeenCalled();
  });

  it('should not claim a tenant while chat is disabled for the workspace', async () => {
    process.env[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'false';

    expect(
      await registerTeamsConnection({
        connectedAccountId: CONNECTED_ACCOUNT_ID,
      }),
    ).toEqual({ claimedTenantId: null });
    expect(getConnectionMock).not.toHaveBeenCalled();
    expect(kvSetMock).not.toHaveBeenCalled();
  });

  it('should fail without claiming when Graph returns no organization', async () => {
    fetchGraphJsonMock.mockResolvedValue({ value: [] });

    await expect(
      registerTeamsConnection({ connectedAccountId: CONNECTED_ACCOUNT_ID }),
    ).rejects.toThrow('no organization');
    expect(kvSetMock).not.toHaveBeenCalled();
  });
});
