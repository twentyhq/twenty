import { describe, expect, it, vi } from 'vitest';

import { slackConnectionStatusHandler } from 'src/logic-functions/handlers/slack-connection-status-handler';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';

vi.mock('src/logic-functions/utils/get-slack-connection', () => ({
  getSlackConnection: vi.fn(),
}));

describe('slackConnectionStatusHandler', () => {
  it('should report a connected workspace', async () => {
    vi.mocked(getSlackConnection).mockResolvedValueOnce({
      success: true,
      accessToken: 'xoxb-token',
    });

    await expect(slackConnectionStatusHandler()).resolves.toEqual({
      success: true,
      isConnected: true,
    });
  });

  it('should report a missing connection without failing', async () => {
    vi.mocked(getSlackConnection).mockResolvedValueOnce({
      success: false,
      error: 'Slack is not connected.',
    });

    await expect(slackConnectionStatusHandler()).resolves.toEqual({
      success: true,
      isConnected: false,
    });
  });
});
