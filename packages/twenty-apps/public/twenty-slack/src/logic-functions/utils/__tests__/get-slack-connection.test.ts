import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';

const { listConnectionsMock } = vi.hoisted(() => ({
  listConnectionsMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  listConnections: listConnectionsMock,
}));

describe('getSlackConnection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should query connections for the slack provider', async () => {
    listConnectionsMock.mockResolvedValue([
      { visibility: 'workspace', accessToken: 'workspace-token' },
    ]);

    await getSlackConnection();

    expect(listConnectionsMock).toHaveBeenCalledWith({ providerName: 'slack' });
  });

  it('should prefer a workspace-visibility connection over a personal one', async () => {
    listConnectionsMock.mockResolvedValue([
      { visibility: 'personal', accessToken: 'personal-token' },
      { visibility: 'workspace', accessToken: 'workspace-token' },
    ]);

    const result = await getSlackConnection();

    expect(result).toEqual({ success: true, accessToken: 'workspace-token' });
  });

  it('should fall back to the first connection when none are workspace-visible', async () => {
    listConnectionsMock.mockResolvedValue([
      { visibility: 'personal', accessToken: 'first-token' },
      { visibility: 'personal', accessToken: 'second-token' },
    ]);

    const result = await getSlackConnection();

    expect(result).toEqual({ success: true, accessToken: 'first-token' });
  });

  it('should fail when there is no Slack connection', async () => {
    listConnectionsMock.mockResolvedValue([]);

    const result = await getSlackConnection();

    expect(result.success).toBe(false);
  });

  it('should fail gracefully when listing connections throws', async () => {
    listConnectionsMock.mockRejectedValue(new Error('network down'));

    const result = await getSlackConnection();

    expect(result).toEqual({ success: false, error: 'network down' });
  });
});
