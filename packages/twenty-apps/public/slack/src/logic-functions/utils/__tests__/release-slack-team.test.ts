import { beforeEach, describe, expect, it, vi } from 'vitest';

import { releaseSlackTeam } from 'src/logic-functions/utils/release-slack-team';

const { kvGetMock, kvDeleteMock } = vi.hoisted(() => ({
  kvGetMock: vi.fn(),
  kvDeleteMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock, delete: kvDeleteMock },
}));

describe('releaseSlackTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw when the payload has no connectedAccountId', async () => {
    await expect(
      releaseSlackTeam({ connectedAccountId: '' }),
    ).rejects.toThrow();
  });

  it('should release the server-scoped claim of the team the connection had claimed', async () => {
    kvGetMock.mockResolvedValue('T123');

    const result = await releaseSlackTeam({
      connectedAccountId: 'connected-account-1',
    });

    expect(kvGetMock).toHaveBeenCalledWith(
      'slack-connected-account-team:connected-account-1',
    );
    expect(kvDeleteMock).toHaveBeenCalledWith('slack-team:T123', {
      scope: 'SERVER',
    });
    expect(kvDeleteMock).toHaveBeenCalledWith(
      'slack-connected-account-team:connected-account-1',
    );
    expect(result).toEqual({ ok: true, releasedTeamId: 'T123' });
  });

  it('should do nothing when the connection never recorded a team', async () => {
    kvGetMock.mockResolvedValue(null);

    const result = await releaseSlackTeam({
      connectedAccountId: 'connected-account-1',
    });

    expect(kvDeleteMock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true, releasedTeamId: null });
  });
});
