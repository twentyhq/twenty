import { beforeEach, describe, expect, it, vi } from 'vitest';

import { releaseAllSlackTeams } from 'src/logic-functions/utils/release-all-slack-teams';

const { listConnectionsMock, kvGetMock, kvDeleteMock } = vi.hoisted(() => ({
  listConnectionsMock: vi.fn(),
  kvGetMock: vi.fn(),
  kvDeleteMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  listConnections: listConnectionsMock,
  kv: { get: kvGetMock, delete: kvDeleteMock },
}));

describe('releaseAllSlackTeams', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    kvDeleteMock.mockResolvedValue(true);
  });

  it('should release the claim of every remaining Slack connection', async () => {
    listConnectionsMock.mockResolvedValue([
      { id: 'connected-account-1' },
      { id: 'connected-account-2' },
    ]);
    kvGetMock.mockResolvedValueOnce('T123').mockResolvedValueOnce('T456');

    const result = await releaseAllSlackTeams();

    expect(listConnectionsMock).toHaveBeenCalledWith({
      providerName: 'slack',
    });
    expect(kvDeleteMock).toHaveBeenCalledWith('slack-team:T123', {
      scope: 'SERVER',
    });
    expect(kvDeleteMock).toHaveBeenCalledWith('slack-team:T456', {
      scope: 'SERVER',
    });
    expect(result).toEqual({
      ok: true,
      releasedTeamIds: ['T123', 'T456'],
    });
  });

  it('should report no teams when the connections never recorded one', async () => {
    listConnectionsMock.mockResolvedValue([{ id: 'connected-account-1' }]);
    kvGetMock.mockResolvedValue(null);

    const result = await releaseAllSlackTeams();

    expect(kvDeleteMock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true, releasedTeamIds: [] });
  });

  it('should do nothing when the app has no Slack connection left', async () => {
    listConnectionsMock.mockResolvedValue([]);

    const result = await releaseAllSlackTeams();

    expect(kvGetMock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true, releasedTeamIds: [] });
  });
});
