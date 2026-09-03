import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackConnectionStatusHandler } from 'src/logic-functions/handlers/slack-connection-status-handler';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: vi.fn(),
}));

const authTestMock = vi.fn();

const mockConnectedSlackClient = () => {
  vi.mocked(getSlackClient).mockResolvedValueOnce({
    success: true,
    client: { auth: { test: authTestMock } } as never,
  });
};

describe('slackConnectionStatusHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should report a connected workspace with its installed team id', async () => {
    mockConnectedSlackClient();
    authTestMock.mockResolvedValueOnce({ ok: true, team_id: 'T0INSTALLED' });

    await expect(slackConnectionStatusHandler()).resolves.toEqual({
      success: true,
      isConnected: true,
      installedSlackTeamId: 'T0INSTALLED',
    });
  });

  it('should report a missing connection without failing', async () => {
    vi.mocked(getSlackClient).mockResolvedValueOnce({
      success: false,
      error: 'Slack is not connected.',
    });

    await expect(slackConnectionStatusHandler()).resolves.toEqual({
      success: true,
      isConnected: false,
    });

    expect(authTestMock).not.toHaveBeenCalled();
  });

  it('should stay connected without a team id when Slack does not answer', async () => {
    mockConnectedSlackClient();
    authTestMock.mockRejectedValueOnce(new Error('invalid_auth'));

    await expect(slackConnectionStatusHandler()).resolves.toEqual({
      success: true,
      isConnected: true,
      installedSlackTeamId: undefined,
    });
  });

  it('should ignore an empty team id', async () => {
    mockConnectedSlackClient();
    authTestMock.mockResolvedValueOnce({ ok: true, team_id: '' });

    await expect(slackConnectionStatusHandler()).resolves.toEqual({
      success: true,
      isConnected: true,
      installedSlackTeamId: undefined,
    });
  });
});
