import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';

const {
  cacheSlackConnectedAccountTeamMock,
  getSlackConnectedAccountTeamMock,
  getSlackConnectionMock,
} = vi.hoisted(() => ({
  cacheSlackConnectedAccountTeamMock: vi.fn(),
  getSlackConnectedAccountTeamMock: vi.fn(),
  getSlackConnectionMock: vi.fn(),
}));

vi.mock('src/logic-functions/utils/cache-slack-connected-account-team', () => ({
  cacheSlackConnectedAccountTeam: cacheSlackConnectedAccountTeamMock,
}));

vi.mock('src/logic-functions/utils/get-slack-connected-account-team', () => ({
  getSlackConnectedAccountTeam: getSlackConnectedAccountTeamMock,
}));

vi.mock('src/logic-functions/utils/get-slack-connection', () => ({
  getSlackConnection: getSlackConnectionMock,
}));

const TEAM_ID = 'T123';
const CONNECTION_ID = 'connection-1';

const createAuthTestMock = () => vi.fn<() => Promise<{ team_id?: string }>>();

const buildSlackClient = (
  authTestMock: ReturnType<typeof createAuthTestMock>,
) => ({
  auth: { test: authTestMock },
});

describe('getInstalledSlackTeamId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cacheSlackConnectedAccountTeamMock.mockResolvedValue(undefined);
    getSlackConnectionMock.mockResolvedValue({
      success: true,
      accessToken: 'token',
      connectionId: CONNECTION_ID,
    });
  });

  it('should return the team stored for the connection without calling Slack', async () => {
    getSlackConnectedAccountTeamMock.mockResolvedValue(TEAM_ID);
    const authTestMock = createAuthTestMock();

    const result = await getInstalledSlackTeamId(
      buildSlackClient(authTestMock),
    );

    expect(result).toBe(TEAM_ID);
    expect(authTestMock).not.toHaveBeenCalled();
  });

  it('should read the team of the connection the client came from', async () => {
    getSlackConnectedAccountTeamMock.mockResolvedValue(TEAM_ID);

    await getInstalledSlackTeamId(buildSlackClient(createAuthTestMock()));

    expect(getSlackConnectedAccountTeamMock).toHaveBeenCalledWith(
      CONNECTION_ID,
    );
  });

  it('should ask Slack and heal the stored team when nothing is stored', async () => {
    getSlackConnectedAccountTeamMock.mockResolvedValue(null);
    const authTestMock = createAuthTestMock().mockResolvedValue({
      team_id: TEAM_ID,
    });

    const result = await getInstalledSlackTeamId(
      buildSlackClient(authTestMock),
    );

    expect(result).toBe(TEAM_ID);
    expect(authTestMock).toHaveBeenCalledTimes(1);
    expect(cacheSlackConnectedAccountTeamMock).toHaveBeenCalledWith(
      CONNECTION_ID,
      TEAM_ID,
    );
  });

  it('should fall back to Slack when the stored team cannot be read', async () => {
    getSlackConnectedAccountTeamMock.mockRejectedValue(
      new Error('kv unavailable'),
    );
    const authTestMock = createAuthTestMock().mockResolvedValue({
      team_id: TEAM_ID,
    });

    const result = await getInstalledSlackTeamId(
      buildSlackClient(authTestMock),
    );

    expect(result).toBe(TEAM_ID);
  });

  it('should ask Slack without storing anything when no connection resolves', async () => {
    getSlackConnectionMock.mockResolvedValue({
      success: false,
      error: 'Slack is not connected.',
    });
    const authTestMock = createAuthTestMock().mockResolvedValue({
      team_id: TEAM_ID,
    });

    const result = await getInstalledSlackTeamId(
      buildSlackClient(authTestMock),
    );

    expect(result).toBe(TEAM_ID);
    expect(getSlackConnectedAccountTeamMock).not.toHaveBeenCalled();
    expect(cacheSlackConnectedAccountTeamMock).not.toHaveBeenCalled();
  });

  it('should not store anything when Slack returns no team id', async () => {
    getSlackConnectedAccountTeamMock.mockResolvedValue(null);
    const authTestMock = createAuthTestMock().mockResolvedValue({});

    const result = await getInstalledSlackTeamId(
      buildSlackClient(authTestMock),
    );

    expect(result).toBeUndefined();
    expect(cacheSlackConnectedAccountTeamMock).not.toHaveBeenCalled();
  });

  it('should return undefined without throwing when Slack rejects', async () => {
    getSlackConnectedAccountTeamMock.mockResolvedValue(null);
    const authTestMock = createAuthTestMock().mockRejectedValue(
      new Error('invalid_auth'),
    );

    const result = await getInstalledSlackTeamId(
      buildSlackClient(authTestMock),
    );

    expect(result).toBeUndefined();
    expect(cacheSlackConnectedAccountTeamMock).not.toHaveBeenCalled();
  });
});
