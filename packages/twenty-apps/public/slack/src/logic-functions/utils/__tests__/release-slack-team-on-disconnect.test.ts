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

describe('releaseSlackTeamOnDisconnect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listConnectionsMock.mockResolvedValue([]);
  });

  it('should release the claim when no connection is left on that team', async () => {
    kvGetMock.mockResolvedValue('T123');

    const result = await releaseSlackTeamOnDisconnect({
      connectedAccountId: 'connected-account-1',
    });

    expect(kvDeleteMock).toHaveBeenCalledWith('slack-team:T123', {
      scope: 'SERVER',
    });
    expect(result).toEqual({ ok: true, releasedTeamId: 'T123' });
  });

  it('should keep the claim when a live connection still maps to that team', async () => {
    listConnectionsMock.mockResolvedValue([{ id: 'connected-account-2' }]);
    kvGetMock.mockResolvedValue('T123');

    const result = await releaseSlackTeamOnDisconnect({
      connectedAccountId: 'connected-account-1',
    });

    expect(kvDeleteMock).not.toHaveBeenCalledWith('slack-team:T123', {
      scope: 'SERVER',
    });
    expect(kvDeleteMock).toHaveBeenCalledWith(
      'slack-connected-account-team:connected-account-1',
    );
    expect(result).toEqual({ ok: true, releasedTeamId: null });
  });

  it('should release the claim when the remaining connections are on other teams', async () => {
    listConnectionsMock.mockResolvedValue([{ id: 'connected-account-2' }]);
    kvGetMock.mockResolvedValueOnce('T123').mockResolvedValueOnce('T456');

    const result = await releaseSlackTeamOnDisconnect({
      connectedAccountId: 'connected-account-1',
    });

    expect(kvDeleteMock).toHaveBeenCalledWith('slack-team:T123', {
      scope: 'SERVER',
    });
    expect(result).toEqual({ ok: true, releasedTeamId: 'T123' });
  });

  it('should do nothing when the connection never recorded a team', async () => {
    kvGetMock.mockResolvedValue(null);

    const result = await releaseSlackTeamOnDisconnect({
      connectedAccountId: 'connected-account-1',
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
