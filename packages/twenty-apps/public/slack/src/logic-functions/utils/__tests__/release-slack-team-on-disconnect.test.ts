import { beforeEach, describe, expect, it, vi } from 'vitest';

import { releaseSlackTeamOnDisconnect } from 'src/logic-functions/utils/release-slack-team-on-disconnect';

const { listConnectionsMock, kvGetMock, kvDeleteMock } = vi.hoisted(() => ({
  listConnectionsMock: vi.fn(),
  kvGetMock: vi.fn(),
  kvDeleteMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  listConnections: listConnectionsMock,
  kv: { get: kvGetMock, delete: kvDeleteMock },
}));

const DISCONNECTED_ACCOUNT_ID = 'connected-account-1';
const DISCONNECTED_ACCOUNT_TEAM_KEY =
  'slack-connected-account-team:connected-account-1';

// One entry per connected account id, so a test never depends on how many
// times the code reads the same key.
const mockRecordedTeams = (teamIdByConnectedAccountId: {
  [connectedAccountId: string]: string | null;
}) => {
  kvGetMock.mockImplementation(async (key: string) => {
    const connectedAccountId = key.replace('slack-connected-account-team:', '');

    return teamIdByConnectedAccountId[connectedAccountId] ?? null;
  });
};

describe('releaseSlackTeamOnDisconnect', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    listConnectionsMock.mockResolvedValue([]);
    kvGetMock.mockResolvedValue(null);
    kvDeleteMock.mockResolvedValue(true);
  });

  it('should release the claim when no connection is left on that team', async () => {
    mockRecordedTeams({ [DISCONNECTED_ACCOUNT_ID]: 'T123' });

    const result = await releaseSlackTeamOnDisconnect({
      connectedAccountId: DISCONNECTED_ACCOUNT_ID,
    });

    expect(kvDeleteMock).toHaveBeenCalledWith('slack-team:T123', {
      scope: 'SERVER',
    });
    expect(kvDeleteMock).toHaveBeenCalledWith(DISCONNECTED_ACCOUNT_TEAM_KEY);
    expect(result).toEqual({ ok: true, releasedTeamId: 'T123' });
  });

  it('should keep the claim when a live connection still maps to that team', async () => {
    listConnectionsMock.mockResolvedValue([{ id: 'connected-account-2' }]);
    mockRecordedTeams({
      [DISCONNECTED_ACCOUNT_ID]: 'T123',
      'connected-account-2': 'T123',
    });

    const result = await releaseSlackTeamOnDisconnect({
      connectedAccountId: DISCONNECTED_ACCOUNT_ID,
    });

    expect(kvDeleteMock).not.toHaveBeenCalledWith('slack-team:T123', {
      scope: 'SERVER',
    });
    expect(kvDeleteMock).toHaveBeenCalledWith(DISCONNECTED_ACCOUNT_TEAM_KEY);
    expect(result).toEqual({ ok: true, releasedTeamId: null });
  });

  it('should release the claim when the remaining connections are on other teams', async () => {
    listConnectionsMock.mockResolvedValue([{ id: 'connected-account-2' }]);
    mockRecordedTeams({
      [DISCONNECTED_ACCOUNT_ID]: 'T123',
      'connected-account-2': 'T456',
    });

    const result = await releaseSlackTeamOnDisconnect({
      connectedAccountId: DISCONNECTED_ACCOUNT_ID,
    });

    expect(kvDeleteMock).toHaveBeenCalledWith('slack-team:T123', {
      scope: 'SERVER',
    });
    expect(result).toEqual({ ok: true, releasedTeamId: 'T123' });
  });

  it('should release the claim when the disconnecting connection is still listed', async () => {
    listConnectionsMock.mockResolvedValue([{ id: DISCONNECTED_ACCOUNT_ID }]);
    mockRecordedTeams({ [DISCONNECTED_ACCOUNT_ID]: 'T123' });

    const result = await releaseSlackTeamOnDisconnect({
      connectedAccountId: DISCONNECTED_ACCOUNT_ID,
    });

    expect(kvDeleteMock).toHaveBeenCalledWith('slack-team:T123', {
      scope: 'SERVER',
    });
    expect(result).toEqual({ ok: true, releasedTeamId: 'T123' });
  });

  it('should read the recorded team only once', async () => {
    mockRecordedTeams({ [DISCONNECTED_ACCOUNT_ID]: 'T123' });

    await releaseSlackTeamOnDisconnect({
      connectedAccountId: DISCONNECTED_ACCOUNT_ID,
    });

    expect(
      kvGetMock.mock.calls.filter(
        ([key]) => key === DISCONNECTED_ACCOUNT_TEAM_KEY,
      ),
    ).toHaveLength(1);
  });

  it('should do nothing when the connection never recorded a team', async () => {
    const result = await releaseSlackTeamOnDisconnect({
      connectedAccountId: DISCONNECTED_ACCOUNT_ID,
    });

    expect(listConnectionsMock).not.toHaveBeenCalled();
    expect(kvDeleteMock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true, releasedTeamId: null });
  });

  it('should throw when the payload has no connectedAccountId', async () => {
    await expect(
      releaseSlackTeamOnDisconnect({ connectedAccountId: '' }),
    ).rejects.toThrow();
  });
});
