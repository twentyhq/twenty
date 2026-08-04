import { beforeEach, describe, expect, it, vi } from 'vitest';

import { backfillSlackConnectedAccountTeams } from 'src/logic-functions/utils/backfill-slack-connected-account-teams';

const { listConnectionsMock, kvGetMock, kvSetMock, authTestMock } = vi.hoisted(
  () => ({
    listConnectionsMock: vi.fn(),
    kvGetMock: vi.fn(),
    kvSetMock: vi.fn(),
    authTestMock: vi.fn(),
  }),
);

vi.mock('twenty-sdk/logic-function', () => ({
  listConnections: listConnectionsMock,
  kv: { get: kvGetMock, set: kvSetMock },
}));

vi.mock('@slack/web-api', () => ({
  WebClient: class {
    auth = { test: authTestMock };
  },
}));

describe('backfillSlackConnectedAccountTeams', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    kvGetMock.mockResolvedValue(null);
  });

  it('should record the team of a connection that has no mapping yet', async () => {
    listConnectionsMock.mockResolvedValue([
      { id: 'connected-account-1', accessToken: 'token-1' },
    ]);
    authTestMock.mockResolvedValue({ team_id: 'T123' });

    const result = await backfillSlackConnectedAccountTeams();

    expect(kvSetMock).toHaveBeenCalledWith(
      'slack-connected-account-team:connected-account-1',
      'T123',
    );
    expect(result).toEqual({
      ok: true,
      backfilledConnectedAccountIds: ['connected-account-1'],
      failedConnectedAccountIds: [],
    });
  });

  it('should leave a connection that already recorded its team alone', async () => {
    listConnectionsMock.mockResolvedValue([
      { id: 'connected-account-1', accessToken: 'token-1' },
    ]);
    kvGetMock.mockResolvedValue('T123');

    const result = await backfillSlackConnectedAccountTeams();

    expect(authTestMock).not.toHaveBeenCalled();
    expect(kvSetMock).not.toHaveBeenCalled();
    expect(result.backfilledConnectedAccountIds).toEqual([]);
  });

  it('should report the connections Slack could not answer for and keep going', async () => {
    listConnectionsMock.mockResolvedValue([
      { id: 'connected-account-1', accessToken: 'revoked' },
      { id: 'connected-account-2', accessToken: 'token-2' },
    ]);
    authTestMock
      .mockRejectedValueOnce(new Error('invalid_auth'))
      .mockResolvedValueOnce({ team_id: 'T456' });

    const result = await backfillSlackConnectedAccountTeams();

    expect(kvSetMock).toHaveBeenCalledWith(
      'slack-connected-account-team:connected-account-2',
      'T456',
    );
    expect(result).toEqual({
      ok: true,
      backfilledConnectedAccountIds: ['connected-account-2'],
      failedConnectedAccountIds: ['connected-account-1'],
    });
  });

  it('should do nothing when there is no Slack connection', async () => {
    listConnectionsMock.mockResolvedValue([]);

    const result = await backfillSlackConnectedAccountTeams();

    expect(kvSetMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: true,
      backfilledConnectedAccountIds: [],
      failedConnectedAccountIds: [],
    });
  });
});
