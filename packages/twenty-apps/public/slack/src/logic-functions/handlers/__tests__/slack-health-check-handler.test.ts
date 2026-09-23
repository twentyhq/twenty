import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_CONNECTION_STATUS_TIMEOUT_MS } from 'src/logic-functions/constants/slack-connection-status-timeout-ms';
import { slackHealthCheckHandler } from 'src/logic-functions/handlers/slack-health-check-handler';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { resolveSlackConnectionHealth } from 'src/logic-functions/utils/resolve-slack-connection-health';

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: vi.fn(),
}));

vi.mock('src/logic-functions/utils/resolve-slack-connection-health', () => ({
  resolveSlackConnectionHealth: vi.fn(),
}));

describe('slackHealthCheckHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSlackClient).mockResolvedValue({
      success: true,
      client: {} as WebClient,
      connectionId: 'connected-account-1',
    });
    vi.mocked(resolveSlackConnectionHealth).mockResolvedValue({
      connectionHealth: 'ok',
      installedSlackTeamId: 'T0INSTALLED',
    });
  });

  it('should bound the Slack call so a hanging Slack cannot exhaust the check budget', async () => {
    await slackHealthCheckHandler();

    expect(getSlackClient).toHaveBeenCalledWith({
      timeout: SLACK_CONNECTION_STATUS_TIMEOUT_MS,
      retryConfig: { retries: 0 },
    });
  });

  it('should report nothing for a healthy connection', async () => {
    await expect(slackHealthCheckHandler()).resolves.toEqual({ status: 'OK' });
  });

  it('should report nothing when Slack is not connected', async () => {
    vi.mocked(getSlackClient).mockResolvedValue({
      success: false,
      error: 'Slack is not connected.',
    });

    await expect(slackHealthCheckHandler()).resolves.toEqual({ status: 'OK' });

    expect(resolveSlackConnectionHealth).not.toHaveBeenCalled();
  });

  it('should report nothing when the health could not be verified', async () => {
    vi.mocked(resolveSlackConnectionHealth).mockResolvedValue({
      connectionHealth: undefined,
      installedSlackTeamId: 'T0INSTALLED',
    });

    await expect(slackHealthCheckHandler()).resolves.toEqual({ status: 'OK' });
  });

  it('should report a rejected token with a button to the connection', async () => {
    vi.mocked(resolveSlackConnectionHealth).mockResolvedValue({
      connectionHealth: 'token_rejected',
      installedSlackTeamId: undefined,
    });

    await expect(slackHealthCheckHandler()).resolves.toEqual({
      status: 'ERROR',
      title: 'Slack connection is no longer valid',
      description: expect.stringContaining('Slack rejected the stored'),
      action: { label: 'Manage connection', location: '#general' },
    });
  });

  it('should report a Slack workspace claimed by another Twenty workspace', async () => {
    vi.mocked(resolveSlackConnectionHealth).mockResolvedValue({
      connectionHealth: 'team_claimed_by_another_workspace',
      installedSlackTeamId: 'T0INSTALLED',
    });

    await expect(slackHealthCheckHandler()).resolves.toEqual(
      expect.objectContaining({
        status: 'ERROR',
        title: 'Slack workspace already connected elsewhere',
      }),
    );
  });

  it('should report an unclaimed Slack workspace', async () => {
    vi.mocked(resolveSlackConnectionHealth).mockResolvedValue({
      connectionHealth: 'team_unclaimed',
      installedSlackTeamId: 'T0INSTALLED',
    });

    await expect(slackHealthCheckHandler()).resolves.toEqual(
      expect.objectContaining({
        status: 'ERROR',
        title: 'Slack connection needs to be registered again',
      }),
    );
  });
});
