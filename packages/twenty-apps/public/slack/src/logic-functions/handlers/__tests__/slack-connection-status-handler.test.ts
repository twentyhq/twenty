import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackConnectionStatusHandler } from 'src/logic-functions/handlers/slack-connection-status-handler';
import { fetchCurrentWorkspaceId } from 'src/logic-functions/utils/fetch-current-workspace-id';
import { findClaimedWorkspaceId } from 'src/logic-functions/utils/find-claimed-workspace-id';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { readSlackRosterMatchOutcome } from 'src/logic-functions/utils/read-slack-roster-match-outcome';

const authTest = vi.fn();

vi.mock('@slack/web-api', () => ({
  WebClient: class {
    auth = { test: authTest };
  },
}));

vi.mock('src/logic-functions/utils/get-slack-connection', () => ({
  getSlackConnection: vi.fn(),
}));

vi.mock('src/logic-functions/utils/find-claimed-workspace-id', () => ({
  findClaimedWorkspaceId: vi.fn(),
}));

vi.mock('src/logic-functions/utils/fetch-current-workspace-id', () => ({
  fetchCurrentWorkspaceId: vi.fn(),
}));

vi.mock('src/logic-functions/utils/read-slack-roster-match-outcome', () => ({
  readSlackRosterMatchOutcome: vi.fn(),
}));

describe('slackConnectionStatusHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSlackConnection).mockResolvedValue({
      success: true,
      accessToken: 'xoxb-token',
    });
    authTest.mockResolvedValue({ ok: true, team_id: 'T1' });
    vi.mocked(findClaimedWorkspaceId).mockResolvedValue('workspace-1');
    vi.mocked(fetchCurrentWorkspaceId).mockResolvedValue('workspace-1');
    vi.mocked(readSlackRosterMatchOutcome).mockResolvedValue(undefined);
  });

  it('should report a missing connection without failing', async () => {
    vi.mocked(getSlackConnection).mockResolvedValue({
      success: false,
      error: 'Slack is not connected.',
    });

    await expect(slackConnectionStatusHandler()).resolves.toEqual({
      success: true,
      isConnected: false,
    });
  });

  it('should report a healthy connection claimed by this workspace', async () => {
    await expect(slackConnectionStatusHandler()).resolves.toEqual({
      success: true,
      isConnected: true,
      connectionHealth: 'ok',
      hasRosterMatchFailed: false,
    });
  });

  it('should flag a recorded roster match failure', async () => {
    vi.mocked(readSlackRosterMatchOutcome).mockResolvedValue({
      isSuccessful: false,
      errorMessage: 'kaboom',
    });

    await expect(slackConnectionStatusHandler()).resolves.toEqual({
      success: true,
      isConnected: true,
      connectionHealth: 'ok',
      hasRosterMatchFailed: true,
    });
  });

  it('should report a rejected token', async () => {
    authTest.mockRejectedValue(
      new Error('An API error occurred: invalid_auth'),
    );

    await expect(slackConnectionStatusHandler()).resolves.toEqual({
      success: true,
      isConnected: true,
      connectionHealth: 'token_rejected',
    });
  });

  it('should not raise an alarm on a transient auth.test failure', async () => {
    authTest.mockRejectedValue(new Error('socket hang up'));

    await expect(slackConnectionStatusHandler()).resolves.toEqual({
      success: true,
      isConnected: true,
    });
  });

  it('should report a team claimed by another workspace', async () => {
    vi.mocked(findClaimedWorkspaceId).mockResolvedValue('workspace-2');

    await expect(slackConnectionStatusHandler()).resolves.toEqual({
      success: true,
      isConnected: true,
      connectionHealth: 'team_claimed_by_another_workspace',
    });
  });

  it('should stay quiet when the claim lookup fails transiently', async () => {
    vi.mocked(findClaimedWorkspaceId).mockRejectedValue(
      new Error('kv unavailable'),
    );

    await expect(slackConnectionStatusHandler()).resolves.toEqual({
      success: true,
      isConnected: true,
    });
  });

  it('should report an unclaimed team', async () => {
    vi.mocked(findClaimedWorkspaceId).mockResolvedValue(null);

    await expect(slackConnectionStatusHandler()).resolves.toEqual({
      success: true,
      isConnected: true,
      connectionHealth: 'team_unclaimed',
    });
  });

  it('should stay quiet when the current workspace id is unknown', async () => {
    vi.mocked(fetchCurrentWorkspaceId).mockResolvedValue(undefined);
    vi.mocked(findClaimedWorkspaceId).mockResolvedValue('workspace-2');

    await expect(slackConnectionStatusHandler()).resolves.toEqual({
      success: true,
      isConnected: true,
      connectionHealth: 'ok',
      hasRosterMatchFailed: false,
    });
  });
});
