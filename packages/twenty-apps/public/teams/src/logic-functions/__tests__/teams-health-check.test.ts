import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { buildTeamsTenantClaimConflictKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-claim-conflict-kv-key';
import { buildTeamsTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-kv-key';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { teamsHealthCheckHandler } from 'src/logic-functions/teams-health-check';

const {
  listTeamsConnectionsMock,
  kvGetMock,
  fetchCurrentWorkspaceIdOrThrowMock,
  releaseFlags,
} = vi.hoisted(() => ({
  listTeamsConnectionsMock: vi.fn(),
  kvGetMock: vi.fn(),
  fetchCurrentWorkspaceIdOrThrowMock: vi.fn(),
  releaseFlags: { IS_CHAT_ASSISTANT_RELEASED: false },
}));

vi.mock(
  'src/features/chat/logic-functions/utils/fetch-current-workspace-id-or-throw',
  () => ({
    fetchCurrentWorkspaceIdOrThrow: fetchCurrentWorkspaceIdOrThrowMock,
  }),
);

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock },
}));

vi.mock('src/constants/release-flags', () => ({
  RELEASE_FLAGS: releaseFlags,
}));

vi.mock(
  'src/features/transcripts/logic-functions/utils/list-teams-connections',
  () => ({ listTeamsConnections: listTeamsConnectionsMock }),
);

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

const enableChat = () => {
  releaseFlags.IS_CHAT_ASSISTANT_RELEASED = true;
  vi.stubEnv(CHAT_ENABLED_APPLICATION_VARIABLE_KEY, 'true');
};

describe('teamsHealthCheckHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = false;
    vi.stubEnv(TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY, 'true');
    listTeamsConnectionsMock.mockResolvedValue([]);
    kvGetMock.mockResolvedValue(null);
    fetchCurrentWorkspaceIdOrThrowMock.mockResolvedValue('this-workspace-id');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should report a missing connection with a button to the connections', async () => {
    await expect(teamsHealthCheckHandler()).resolves.toEqual({
      status: 'WARNING',
      title: 'Microsoft Teams is not connected',
      description: expect.stringContaining('No working Microsoft Teams'),
      action: { label: 'Open connections', location: '#general/connections' },
    });

    expect(listTeamsConnectionsMock).toHaveBeenCalledExactlyOnceWith();
  });

  it('should report nothing once a working connection exists', async () => {
    listTeamsConnectionsMock.mockResolvedValue([
      { id: 'connection-1', authFailedAt: '2026-10-01T00:00:00.000Z' },
      { id: 'connection-2', authFailedAt: null },
    ]);

    await expect(teamsHealthCheckHandler()).resolves.toEqual({ status: 'OK' });

    expect(listTeamsConnectionsMock).toHaveBeenCalledExactlyOnceWith();
  });

  it('should let personal connections alone satisfy transcript imports', async () => {
    listTeamsConnectionsMock.mockResolvedValue([PERSONAL_CONNECTION]);

    await expect(teamsHealthCheckHandler()).resolves.toEqual({ status: 'OK' });

    expect(listTeamsConnectionsMock).toHaveBeenCalledExactlyOnceWith();
  });

  it('should ask to reconnect when every connection was rejected', async () => {
    listTeamsConnectionsMock.mockResolvedValue([
      { id: 'connection-1', authFailedAt: '2026-10-01T00:00:00.000Z' },
    ]);

    await expect(teamsHealthCheckHandler()).resolves.toEqual({
      status: 'ERROR',
      title: 'Microsoft Teams connection needs to be reconnected',
      description: expect.stringContaining('Microsoft rejected the stored'),
      action: { label: 'Manage connection', location: '#general/connections' },
    });

    expect(listTeamsConnectionsMock).toHaveBeenCalledExactlyOnceWith();
  });

  it('should ask for a workspace connection when chat only has personal ones', async () => {
    enableChat();
    listTeamsConnectionsMock.mockResolvedValue([PERSONAL_CONNECTION]);

    await expect(teamsHealthCheckHandler()).resolves.toEqual({
      status: 'WARNING',
      title: 'Microsoft Teams chat needs a workspace connection',
      description: expect.stringContaining('personal connections do not count'),
      action: { label: 'Open connections', location: '#general/connections' },
    });

    expect(listTeamsConnectionsMock).toHaveBeenCalledExactlyOnceWith();
  });

  it('should report nothing for chat once a workspace connection works', async () => {
    enableChat();
    listTeamsConnectionsMock.mockResolvedValue([
      PERSONAL_CONNECTION,
      WORKSPACE_CONNECTION,
    ]);

    await expect(teamsHealthCheckHandler()).resolves.toEqual({ status: 'OK' });

    expect(listTeamsConnectionsMock).toHaveBeenCalledExactlyOnceWith();
  });

  const recordLostClaim = (claimingWorkspaceId: string | null) => {
    kvGetMock.mockImplementation(
      async (key: string, options?: { scope: string }) => {
        if (options?.scope === 'SERVER') {
          return key === buildTeamsTenantKvKey('tenant-id')
            ? claimingWorkspaceId
            : null;
        }

        return key ===
          buildTeamsTenantClaimConflictKvKey(WORKSPACE_CONNECTION.id)
          ? { tenantId: 'tenant-id' }
          : null;
      },
    );
  };

  it('should report chat as taken when another workspace holds the tenant this connection lost', async () => {
    enableChat();
    listTeamsConnectionsMock.mockResolvedValue([
      PERSONAL_CONNECTION,
      WORKSPACE_CONNECTION,
    ]);
    recordLostClaim('other-workspace-id');

    await expect(teamsHealthCheckHandler()).resolves.toEqual({
      status: 'ERROR',
      title: 'Microsoft Teams chat is taken by another workspace',
      description: expect.stringContaining('Transcripts still import here'),
      action: { label: 'Manage connection', location: '#general/connections' },
    });

    expect(kvGetMock).toHaveBeenCalledWith(
      buildTeamsTenantClaimConflictKvKey(WORKSPACE_CONNECTION.id),
    );
    expect(kvGetMock).toHaveBeenCalledWith(buildTeamsTenantKvKey('tenant-id'), {
      scope: 'SERVER',
    });
  });

  it.each([
    ['this workspace holds the tenant again', 'this-workspace-id'],
    ['nobody holds the tenant any more', null],
  ])(
    'should report nothing for a recorded conflict once %s',
    async (_, claimingWorkspaceId) => {
      enableChat();
      listTeamsConnectionsMock.mockResolvedValue([WORKSPACE_CONNECTION]);
      recordLostClaim(claimingWorkspaceId);

      await expect(teamsHealthCheckHandler()).resolves.toEqual({
        status: 'OK',
      });
    },
  );

  it('should report nothing when no feature needs a connection', async () => {
    vi.stubEnv(TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY, 'false');

    await expect(teamsHealthCheckHandler()).resolves.toEqual({ status: 'OK' });

    expect(listTeamsConnectionsMock).not.toHaveBeenCalled();
  });
});
