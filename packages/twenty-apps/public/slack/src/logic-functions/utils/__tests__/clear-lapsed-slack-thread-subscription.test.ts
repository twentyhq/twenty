import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearLapsedSlackThreadSubscription } from 'src/logic-functions/utils/clear-lapsed-slack-thread-subscription';

const { kvGetMock, kvDeleteMock } = vi.hoisted(() => ({
  kvGetMock: vi.fn(),
  kvDeleteMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock, delete: kvDeleteMock },
}));

const THREAD_REFERENCE = {
  channelId: 'C123',
  threadTimestamp: '1700000000.000100',
};

const EXPECTED_KEY = 'slack-thread:C123:1700000000.000100';

describe('clearLapsedSlackThreadSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete the key when the subscription is still lapsed', async () => {
    kvGetMock.mockResolvedValue({ expiresAt: Date.now() - 60_000 });

    await clearLapsedSlackThreadSubscription(THREAD_REFERENCE);

    expect(kvDeleteMock).toHaveBeenCalledWith(EXPECTED_KEY);
  });

  it('should delete the key when nothing is stored anymore', async () => {
    kvGetMock.mockResolvedValue(null);

    await clearLapsedSlackThreadSubscription(THREAD_REFERENCE);

    expect(kvDeleteMock).toHaveBeenCalledWith(EXPECTED_KEY);
  });

  it('should keep a subscription that was renewed in the meantime', async () => {
    kvGetMock.mockResolvedValue({ expiresAt: Date.now() + 60_000 });

    await clearLapsedSlackThreadSubscription(THREAD_REFERENCE);

    expect(kvDeleteMock).not.toHaveBeenCalled();
  });
});
