import { type AuthTestResponse } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';

const { getSlackConnectedAccountTeamMock, setSlackConnectedAccountTeamMock } =
  vi.hoisted(() => ({
    getSlackConnectedAccountTeamMock: vi.fn(),
    setSlackConnectedAccountTeamMock: vi.fn(),
  }));

vi.mock('src/logic-functions/utils/get-slack-connected-account-team', () => ({
  getSlackConnectedAccountTeam: getSlackConnectedAccountTeamMock,
}));

vi.mock('src/logic-functions/utils/set-slack-connected-account-team', () => ({
  setSlackConnectedAccountTeam: setSlackConnectedAccountTeamMock,
}));

const TEAM_ID = 'T123';
const CONNECTION_ID = 'connection-1';

const createAuthTestMock = () => vi.fn<() => Promise<AuthTestResponse>>();

const buildSlackClient = (
  authTestMock: ReturnType<typeof createAuthTestMock>,
) => ({ auth: { test: authTestMock } });

describe('getInstalledSlackTeamId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setSlackConnectedAccountTeamMock.mockResolvedValue(undefined);
  });

  it('should return the team stored for the connection without calling Slack', async () => {
    getSlackConnectedAccountTeamMock.mockResolvedValue(TEAM_ID);
    const authTestMock = createAuthTestMock();

    const result = await getInstalledSlackTeamId({
      slackClient: buildSlackClient(authTestMock),
      slackConnectionId: CONNECTION_ID,
    });

    expect(result).toBe(TEAM_ID);
    expect(authTestMock).not.toHaveBeenCalled();
    expect(getSlackConnectedAccountTeamMock).toHaveBeenCalledWith(
      CONNECTION_ID,
    );
  });

  it('should ask Slack and heal the stored team when nothing is stored', async () => {
    getSlackConnectedAccountTeamMock.mockResolvedValue(null);
    const authTestMock = createAuthTestMock().mockResolvedValue({
      ok: true,
      team_id: TEAM_ID,
    });

    const result = await getInstalledSlackTeamId({
      slackClient: buildSlackClient(authTestMock),
      slackConnectionId: CONNECTION_ID,
    });

    expect(result).toBe(TEAM_ID);
    expect(authTestMock).toHaveBeenCalledTimes(1);
    expect(setSlackConnectedAccountTeamMock).toHaveBeenCalledWith({
      connectedAccountId: CONNECTION_ID,
      slackTeamId: TEAM_ID,
    });
  });

  it('should fall back to Slack when the stored team cannot be read', async () => {
    getSlackConnectedAccountTeamMock.mockRejectedValue(
      new Error('kv unavailable'),
    );
    const authTestMock = createAuthTestMock().mockResolvedValue({
      ok: true,
      team_id: TEAM_ID,
    });

    const result = await getInstalledSlackTeamId({
      slackClient: buildSlackClient(authTestMock),
      slackConnectionId: CONNECTION_ID,
    });

    expect(result).toBe(TEAM_ID);
  });

  it('should ask Slack without touching the store when no connection is known', async () => {
    const authTestMock = createAuthTestMock().mockResolvedValue({
      ok: true,
      team_id: TEAM_ID,
    });

    const result = await getInstalledSlackTeamId({
      slackClient: buildSlackClient(authTestMock),
      slackConnectionId: undefined,
    });

    expect(result).toBe(TEAM_ID);
    expect(getSlackConnectedAccountTeamMock).not.toHaveBeenCalled();
    expect(setSlackConnectedAccountTeamMock).not.toHaveBeenCalled();
  });

  it('should not store anything when Slack returns no team id', async () => {
    getSlackConnectedAccountTeamMock.mockResolvedValue(null);
    const authTestMock = createAuthTestMock().mockResolvedValue({ ok: true });

    const result = await getInstalledSlackTeamId({
      slackClient: buildSlackClient(authTestMock),
      slackConnectionId: CONNECTION_ID,
    });

    expect(result).toBeUndefined();
    expect(setSlackConnectedAccountTeamMock).not.toHaveBeenCalled();
  });

  it('should return undefined without throwing when Slack rejects', async () => {
    getSlackConnectedAccountTeamMock.mockResolvedValue(null);
    const authTestMock = createAuthTestMock().mockRejectedValue(
      new Error('invalid_auth'),
    );

    const result = await getInstalledSlackTeamId({
      slackClient: buildSlackClient(authTestMock),
      slackConnectionId: CONNECTION_ID,
    });

    expect(result).toBeUndefined();
    expect(setSlackConnectedAccountTeamMock).not.toHaveBeenCalled();
  });

  it('should return undefined without throwing when healing the stored team fails', async () => {
    getSlackConnectedAccountTeamMock.mockResolvedValue(null);
    setSlackConnectedAccountTeamMock.mockRejectedValue(
      new Error('kv unavailable'),
    );
    const authTestMock = createAuthTestMock().mockResolvedValue({
      ok: true,
      team_id: TEAM_ID,
    });

    const result = await getInstalledSlackTeamId({
      slackClient: buildSlackClient(authTestMock),
      slackConnectionId: CONNECTION_ID,
    });

    expect(result).toBe(TEAM_ID);
  });
});
