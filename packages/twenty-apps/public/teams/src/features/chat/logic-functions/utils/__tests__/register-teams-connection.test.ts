import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { buildTeamsConnectedAccountTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-connected-account-tenant-kv-key';
import { buildTeamsTenantClaimConflictKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-claim-conflict-kv-key';
import { buildTeamsTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-kv-key';
import { registerTeamsConnection } from 'src/features/chat/logic-functions/utils/register-teams-connection';

const {
  releaseFlags,
  kvGetMock,
  kvSetMock,
  kvDeleteMock,
  getConnectionMock,
  fetchGraphJsonMock,
  releaseMock,
  matchTeamsDirectoryByEmailMock,
} = vi.hoisted(() => ({
  releaseFlags: { IS_CHAT_ASSISTANT_RELEASED: true },
  kvGetMock: vi.fn(),
  kvSetMock: vi.fn(),
  kvDeleteMock: vi.fn(),
  getConnectionMock: vi.fn(),
  fetchGraphJsonMock: vi.fn(),
  releaseMock: vi.fn(),
  matchTeamsDirectoryByEmailMock: vi.fn(),
}));

vi.mock('src/constants/release-flags', () => ({
  RELEASE_FLAGS: releaseFlags,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock, set: kvSetMock, delete: kvDeleteMock },
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

vi.mock(
  'src/features/chat/logic-functions/utils/match-teams-directory-by-email',
  () => ({ matchTeamsDirectoryByEmail: matchTeamsDirectoryByEmailMock }),
);

const CONNECTED_ACCOUNT_ID = 'connected-account-id';
const WORKSPACE_ID = 'this-workspace-id';
const TENANT_ID = 'tenant-id';
const DIRECTORY_SCOPE = 'https://graph.microsoft.com/User.ReadBasic.All';
const CONNECTED_ACCOUNT_TENANT_KV_KEY =
  buildTeamsConnectedAccountTenantKvKey(CONNECTED_ACCOUNT_ID);
const CLAIM_CONFLICT_KV_KEY =
  buildTeamsTenantClaimConflictKvKey(CONNECTED_ACCOUNT_ID);

const rejectServerClaim = () => {
  kvSetMock.mockImplementation(
    async (_key: string, _value: unknown, options?: { scope: string }) => {
      if (options?.scope === 'SERVER') {
        throw new Error('kv.set() failed: already claimed');
      }
    },
  );
};

describe('registerTeamsConnection', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = true;
    process.env[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';
    getConnectionMock.mockResolvedValue({
      scope: 'WORKSPACE',
      scopes: [DIRECTORY_SCOPE],
      accessToken: 'graph-token',
    });
    fetchGraphJsonMock.mockResolvedValue({ value: [{ id: TENANT_ID }] });
    kvGetMock.mockResolvedValue(null);
    matchTeamsDirectoryByEmailMock.mockResolvedValue(undefined);
  });

  it('should claim the tenant of a workspace-shared connection and remember it for release', async () => {
    expect(
      await registerTeamsConnection({
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).toEqual({ claimedTenantId: TENANT_ID });
    expect(fetchGraphJsonMock).toHaveBeenCalledWith({
      accessToken: 'graph-token',
      url: 'organization?$select=id',
    });
    expect(kvSetMock).toHaveBeenNthCalledWith(
      1,
      CONNECTED_ACCOUNT_TENANT_KV_KEY,
      TENANT_ID,
    );
    expect(kvSetMock).toHaveBeenNthCalledWith(
      2,
      buildTeamsTenantKvKey(TENANT_ID),
      null,
      { scope: 'SERVER' },
    );
    expect(kvDeleteMock).toHaveBeenCalledExactlyOnceWith(CLAIM_CONFLICT_KV_KEY);
  });

  it('should record the conflict instead of failing when another workspace holds the tenant', async () => {
    rejectServerClaim();
    kvGetMock.mockImplementation(
      async (_key: string, options?: { scope: string }) =>
        options?.scope === 'SERVER' ? 'other-workspace-id' : null,
    );

    expect(
      await registerTeamsConnection({
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).toEqual({ claimedTenantId: null, conflictingTenantId: TENANT_ID });
    expect(kvSetMock).toHaveBeenCalledTimes(3);
    expect(kvSetMock).toHaveBeenNthCalledWith(
      2,
      buildTeamsTenantKvKey(TENANT_ID),
      null,
      { scope: 'SERVER' },
    );
    expect(kvSetMock).toHaveBeenNthCalledWith(3, CLAIM_CONFLICT_KV_KEY, {
      tenantId: TENANT_ID,
    });
    expect(kvDeleteMock).toHaveBeenCalledExactlyOnceWith(
      CONNECTED_ACCOUNT_TENANT_KV_KEY,
    );
    expect(releaseMock).not.toHaveBeenCalled();
    expect(matchTeamsDirectoryByEmailMock).not.toHaveBeenCalled();
  });

  it.each([
    ['nobody holds the tenant', null],
    ['this workspace already holds the tenant', WORKSPACE_ID],
  ])(
    'should keep the connection tenant for a retry when the claim fails while %s',
    async (_, claimingWorkspaceId) => {
      rejectServerClaim();
      kvGetMock.mockImplementation(
        async (_key: string, options?: { scope: string }) =>
          options?.scope === 'SERVER' ? claimingWorkspaceId : null,
      );

      await expect(
        registerTeamsConnection({
          connectedAccountId: CONNECTED_ACCOUNT_ID,
          workspaceId: WORKSPACE_ID,
        }),
      ).rejects.toThrow('already claimed');
      expect(kvSetMock).toHaveBeenCalledWith(
        CONNECTED_ACCOUNT_TENANT_KV_KEY,
        TENANT_ID,
      );
      expect(kvDeleteMock).not.toHaveBeenCalled();
      expect(matchTeamsDirectoryByEmailMock).not.toHaveBeenCalled();
    },
  );

  it('should release the previous tenant when a reconnect signs in to another tenant', async () => {
    kvGetMock.mockResolvedValue('previous-tenant-id');

    expect(
      await registerTeamsConnection({
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).toEqual({ claimedTenantId: TENANT_ID });
    expect(releaseMock).toHaveBeenCalledWith({
      connectedAccountId: CONNECTED_ACCOUNT_ID,
    });
    expect(releaseMock.mock.invocationCallOrder[0]).toBeLessThan(
      kvSetMock.mock.invocationCallOrder[0],
    );
  });

  it('should release the claim instead of claiming when the connection is personal', async () => {
    getConnectionMock.mockResolvedValue({
      scope: 'USER',
      scopes: [DIRECTORY_SCOPE],
      accessToken: 'graph-token',
    });

    expect(
      await registerTeamsConnection({
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).toEqual({ claimedTenantId: null });
    expect(releaseMock).toHaveBeenCalledWith({
      connectedAccountId: CONNECTED_ACCOUNT_ID,
    });
    expect(fetchGraphJsonMock).not.toHaveBeenCalled();
    expect(kvSetMock).not.toHaveBeenCalled();
    expect(kvDeleteMock).toHaveBeenCalledExactlyOnceWith(CLAIM_CONFLICT_KV_KEY);
    expect(matchTeamsDirectoryByEmailMock).not.toHaveBeenCalled();
  });

  it('should release the claim instead of claiming while chat is disabled for the workspace', async () => {
    process.env[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'false';

    expect(
      await registerTeamsConnection({
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).toEqual({ claimedTenantId: null });
    expect(releaseMock).toHaveBeenCalledWith({
      connectedAccountId: CONNECTED_ACCOUNT_ID,
    });
    expect(getConnectionMock).not.toHaveBeenCalled();
    expect(kvSetMock).not.toHaveBeenCalled();
    expect(kvDeleteMock).toHaveBeenCalledExactlyOnceWith(CLAIM_CONFLICT_KV_KEY);
  });

  it('should link directory users by email once the tenant is claimed', async () => {
    await registerTeamsConnection({
      connectedAccountId: CONNECTED_ACCOUNT_ID,
      workspaceId: WORKSPACE_ID,
    });

    expect(matchTeamsDirectoryByEmailMock).toHaveBeenCalledWith({
      accessToken: 'graph-token',
      teamsTenantId: TENANT_ID,
    });
    expect(kvSetMock.mock.invocationCallOrder[1]).toBeLessThan(
      matchTeamsDirectoryByEmailMock.mock.invocationCallOrder[0],
    );
  });

  it('should keep the claim when the directory match fails', async () => {
    matchTeamsDirectoryByEmailMock.mockRejectedValue(new Error('graph down'));
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    expect(
      await registerTeamsConnection({
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).toEqual({ claimedTenantId: TENANT_ID });
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[teams] directory email match skipped: graph down',
    );

    consoleWarnSpy.mockRestore();
  });

  it('should skip the directory match when the connection lacks directory access', async () => {
    getConnectionMock.mockResolvedValue({
      scope: 'WORKSPACE',
      scopes: ['https://graph.microsoft.com/User.Read'],
      accessToken: 'graph-token',
    });
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    expect(
      await registerTeamsConnection({
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).toEqual({ claimedTenantId: TENANT_ID });
    expect(matchTeamsDirectoryByEmailMock).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

    consoleWarnSpy.mockRestore();
  });
});
