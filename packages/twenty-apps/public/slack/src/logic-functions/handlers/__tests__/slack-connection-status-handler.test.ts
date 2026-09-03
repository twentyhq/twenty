import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackConnectionStatusHandler } from 'src/logic-functions/handlers/slack-connection-status-handler';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { readSlackRosterMatchRunOutcome } from 'src/logic-functions/utils/read-slack-roster-match-run-outcome';
import { resolveSlackConnectionHealth } from 'src/logic-functions/utils/resolve-slack-connection-health';

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: vi.fn(),
}));

vi.mock('src/logic-functions/utils/resolve-slack-connection-health', () => ({
  resolveSlackConnectionHealth: vi.fn(),
}));

vi.mock(
  'src/logic-functions/utils/read-slack-roster-match-run-outcome',
  () => ({
    readSlackRosterMatchRunOutcome: vi.fn(),
  }),
);

describe('slackConnectionStatusHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSlackClient).mockResolvedValue({
      success: true,
      client: {} as WebClient,
    });
    vi.mocked(resolveSlackConnectionHealth).mockResolvedValue('ok');
    vi.mocked(readSlackRosterMatchRunOutcome).mockResolvedValue(undefined);
  });

  it('should report a missing connection without failing', async () => {
    vi.mocked(getSlackClient).mockResolvedValue({
      success: false,
      error: 'Slack is not connected.',
    });

    await expect(slackConnectionStatusHandler()).resolves.toEqual({
      success: true,
      isConnected: false,
    });
  });

  it('should report a healthy connection', async () => {
    await expect(slackConnectionStatusHandler()).resolves.toEqual({
      success: true,
      isConnected: true,
      connectionHealth: 'ok',
      hasRosterMatchFailed: false,
    });
  });

  it('should report a broken connection', async () => {
    vi.mocked(resolveSlackConnectionHealth).mockResolvedValue('token_rejected');

    await expect(slackConnectionStatusHandler()).resolves.toEqual({
      success: true,
      isConnected: true,
      connectionHealth: 'token_rejected',
      hasRosterMatchFailed: false,
    });
  });

  it('should report no health when it could not be verified', async () => {
    vi.mocked(resolveSlackConnectionHealth).mockResolvedValue(undefined);

    await expect(slackConnectionStatusHandler()).resolves.toEqual({
      success: true,
      isConnected: true,
      hasRosterMatchFailed: false,
    });
  });

  it('should flag a recorded roster match failure', async () => {
    vi.mocked(readSlackRosterMatchRunOutcome).mockResolvedValue({
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
});
