import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackInstallRevokedHandler } from 'src/logic-functions/handlers/slack-install-revoked-handler';

const { kvGetMock, kvDeleteMock, listConnectionsMock } = vi.hoisted(() => ({
  kvGetMock: vi.fn(),
  kvDeleteMock: vi.fn(),
  listConnectionsMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock, delete: kvDeleteMock },
  listConnections: listConnectionsMock,
}));

const mockConnectedAccountTeams = (teamByKey: Record<string, string>) => {
  kvGetMock.mockImplementation((key: string) => {
    return Promise.resolve(teamByKey[key] ?? null);
  });
};

describe('slackInstallRevokedHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should release the team claim and the matching connection entries on app_uninstalled', async () => {
    listConnectionsMock.mockResolvedValue([
      { id: 'connection-1' },
      { id: 'connection-2' },
    ]);
    mockConnectedAccountTeams({
      'slack-connected-account-team:connection-1': 'T123',
      'slack-connected-account-team:connection-2': 'T999',
    });
    kvDeleteMock.mockResolvedValue(true);

    const result = await slackInstallRevokedHandler({
      type: 'event_callback',
      team_id: 'T123',
      event: { type: 'app_uninstalled' },
    });

    expect(result).toEqual({
      ok: true,
      releasedTeamId: 'T123',
      releasedConnectedAccountIds: ['connection-1'],
    });
    expect(kvDeleteMock).toHaveBeenCalledWith(
      'slack-connected-account-team:connection-1',
    );
    expect(kvDeleteMock).not.toHaveBeenCalledWith(
      'slack-connected-account-team:connection-2',
    );
    expect(kvDeleteMock).toHaveBeenCalledWith('slack-team:T123', {
      scope: 'SERVER',
    });
  });

  it('should release the team claim even when no connection matches the team', async () => {
    listConnectionsMock.mockResolvedValue([]);
    mockConnectedAccountTeams({});
    kvDeleteMock.mockResolvedValue(true);

    const result = await slackInstallRevokedHandler({
      type: 'event_callback',
      team_id: 'T123',
      event: { type: 'app_uninstalled' },
    });

    expect(result).toEqual({
      ok: true,
      releasedTeamId: 'T123',
      releasedConnectedAccountIds: [],
    });
    expect(kvDeleteMock).toHaveBeenCalledWith('slack-team:T123', {
      scope: 'SERVER',
    });
  });

  it('should report no released team when the claim delete is refused', async () => {
    listConnectionsMock.mockResolvedValue([]);
    mockConnectedAccountTeams({});
    kvDeleteMock.mockResolvedValue(false);

    const result = await slackInstallRevokedHandler({
      type: 'event_callback',
      team_id: 'T123',
      event: { type: 'app_uninstalled' },
    });

    expect(result).toEqual({
      ok: true,
      releasedTeamId: null,
      releasedConnectedAccountIds: [],
    });
  });

  it('should release the team claim before a failing connection lookup surfaces', async () => {
    listConnectionsMock.mockResolvedValue([{ id: 'connection-1' }]);
    kvGetMock.mockRejectedValue(new Error('kv unavailable'));
    kvDeleteMock.mockResolvedValue(true);

    await expect(
      slackInstallRevokedHandler({
        type: 'event_callback',
        team_id: 'T123',
        event: { type: 'app_uninstalled' },
      }),
    ).rejects.toThrow('kv unavailable');

    expect(kvDeleteMock).toHaveBeenCalledWith('slack-team:T123', {
      scope: 'SERVER',
    });
  });

  it('should release the claim when a tokens_revoked event revokes the bot token', async () => {
    listConnectionsMock.mockResolvedValue([]);
    mockConnectedAccountTeams({});
    kvDeleteMock.mockResolvedValue(true);

    const result = await slackInstallRevokedHandler({
      type: 'event_callback',
      team_id: 'T123',
      event: { type: 'tokens_revoked', tokens: { bot: ['B123'] } },
    });

    expect(result).toEqual({
      ok: true,
      releasedTeamId: 'T123',
      releasedConnectedAccountIds: [],
    });
  });

  it('should skip a tokens_revoked event that spares the bot token', async () => {
    const result = await slackInstallRevokedHandler({
      type: 'event_callback',
      team_id: 'T123',
      event: { type: 'tokens_revoked', tokens: { oauth: ['U123'] } },
    });

    expect(result).toEqual({ ok: true, skipped: 'No bot token was revoked' });
    expect(listConnectionsMock).not.toHaveBeenCalled();
    expect(kvDeleteMock).not.toHaveBeenCalled();
  });

  it('should skip a tokens_revoked event with no token list at all', async () => {
    const result = await slackInstallRevokedHandler({
      type: 'event_callback',
      team_id: 'T123',
      event: { type: 'tokens_revoked' },
    });

    expect(result).toEqual({ ok: true, skipped: 'No bot token was revoked' });
    expect(kvDeleteMock).not.toHaveBeenCalled();
  });

  it('should throw when the event carries no team_id', async () => {
    await expect(
      slackInstallRevokedHandler({
        type: 'event_callback',
        event: { type: 'app_uninstalled' },
      }),
    ).rejects.toThrow('no team_id');
    expect(kvDeleteMock).not.toHaveBeenCalled();
  });
});
