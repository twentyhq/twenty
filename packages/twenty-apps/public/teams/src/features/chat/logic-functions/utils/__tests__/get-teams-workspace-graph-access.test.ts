import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getTeamsWorkspaceGraphAccess } from 'src/features/chat/logic-functions/utils/get-teams-workspace-graph-access';
import { TEAMS_GRAPH_DIRECTORY_SCOPE } from 'src/features/transcripts/constants/teams-oauth-config';

const { listTeamsConnectionsMock, kvGetMock, fetchTeamsTenantIdMock } =
  vi.hoisted(() => ({
    listTeamsConnectionsMock: vi.fn(),
    kvGetMock: vi.fn(),
    fetchTeamsTenantIdMock: vi.fn(),
  }));

vi.mock(
  'src/features/transcripts/logic-functions/utils/list-teams-connections',
  () => ({ listTeamsConnections: listTeamsConnectionsMock }),
);

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock },
}));

vi.mock(
  'src/features/chat/logic-functions/utils/fetch-teams-tenant-id',
  () => ({
    fetchTeamsTenantId: fetchTeamsTenantIdMock,
  }),
);

const WORKSPACE_CONNECTION = {
  id: 'connection-1',
  scope: 'WORKSPACE',
  accessToken: 'token',
  authFailedAt: null,
  scopes: [TEAMS_GRAPH_DIRECTORY_SCOPE],
};

describe('getTeamsWorkspaceGraphAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    kvGetMock.mockResolvedValue('tenant-stored');
    fetchTeamsTenantIdMock.mockResolvedValue('tenant-fetched');
  });

  it('returns the token and the stored tenant of the healthy workspace connection', async () => {
    listTeamsConnectionsMock.mockResolvedValue([
      { ...WORKSPACE_CONNECTION, id: 'failed', authFailedAt: '2026-01-01' },
      { ...WORKSPACE_CONNECTION, scope: 'USER' },
      WORKSPACE_CONNECTION,
    ]);

    const result = await getTeamsWorkspaceGraphAccess();

    expect(result).toEqual({
      success: true,
      accessToken: 'token',
      tenantId: 'tenant-stored',
    });
    expect(fetchTeamsTenantIdMock).not.toHaveBeenCalled();
  });

  it('fetches the tenant from Graph when none is stored', async () => {
    listTeamsConnectionsMock.mockResolvedValue([WORKSPACE_CONNECTION]);
    kvGetMock.mockResolvedValue(null);

    const result = await getTeamsWorkspaceGraphAccess();

    expect(result).toEqual({
      success: true,
      accessToken: 'token',
      tenantId: 'tenant-fetched',
    });
  });

  it('skips an outdated connection without directory access for one that has it', async () => {
    listTeamsConnectionsMock.mockResolvedValue([
      {
        ...WORKSPACE_CONNECTION,
        id: 'outdated',
        accessToken: 'outdated-token',
        scopes: ['https://graph.microsoft.com/User.Read'],
      },
      { ...WORKSPACE_CONNECTION, id: 'current', accessToken: 'current-token' },
    ]);

    const result = await getTeamsWorkspaceGraphAccess();

    expect(result).toEqual({
      success: true,
      accessToken: 'current-token',
      tenantId: 'tenant-stored',
    });
  });

  it('fails when no healthy workspace connection exists', async () => {
    listTeamsConnectionsMock.mockResolvedValue([
      { ...WORKSPACE_CONNECTION, scope: 'USER' },
    ]);

    const result = await getTeamsWorkspaceGraphAccess();

    expect(result.success).toBe(false);
  });

  it('fails when a workspace connection exists but none grant directory access', async () => {
    listTeamsConnectionsMock.mockResolvedValue([
      {
        ...WORKSPACE_CONNECTION,
        scopes: ['https://graph.microsoft.com/User.Read'],
      },
    ]);

    const result = await getTeamsWorkspaceGraphAccess();

    expect(result.success).toBe(false);
    expect(fetchTeamsTenantIdMock).not.toHaveBeenCalled();
  });

  it('returns a structured failure instead of throwing when the connection has no token', async () => {
    listTeamsConnectionsMock.mockResolvedValue([
      { ...WORKSPACE_CONNECTION, accessToken: undefined },
    ]);

    const result = await getTeamsWorkspaceGraphAccess();

    expect(result).toEqual({
      success: false,
      error: 'Connection connection-1 has no access token',
    });
  });
});
