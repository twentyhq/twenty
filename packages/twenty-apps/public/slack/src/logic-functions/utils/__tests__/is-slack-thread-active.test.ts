import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getSlackThreadKvKey } from 'src/logic-functions/utils/get-slack-thread-kv-key';
import { isSlackThreadActive } from 'src/logic-functions/utils/is-slack-thread-active';

const { kvGetMock, kvDeleteMock } = vi.hoisted(() => ({
  kvGetMock: vi.fn(),
  kvDeleteMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock, delete: kvDeleteMock },
}));

const THREAD = { channelId: 'C123', threadTimestamp: '1.1' };
const THREAD_KEY = getSlackThreadKvKey(THREAD);

describe('isSlackThreadActive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    kvDeleteMock.mockResolvedValue(true);
  });

  it('should not read kv when the thread reference is incomplete', async () => {
    await expect(
      isSlackThreadActive({ channelId: '', threadTimestamp: '1.1' }),
    ).resolves.toBe(false);
    expect(kvGetMock).not.toHaveBeenCalled();
  });

  it('should return false when the thread was never subscribed', async () => {
    kvGetMock.mockResolvedValue(null);

    await expect(isSlackThreadActive(THREAD)).resolves.toBe(false);
    expect(kvDeleteMock).not.toHaveBeenCalled();
  });

  it('should return true while the subscription is live', async () => {
    kvGetMock.mockResolvedValue({ expiresAt: Date.now() + 1000 });

    await expect(isSlackThreadActive(THREAD)).resolves.toBe(true);
    expect(kvDeleteMock).not.toHaveBeenCalled();
  });

  it('should drop the subscription once it has expired', async () => {
    kvGetMock.mockResolvedValue({ expiresAt: Date.now() - 1000 });

    await expect(isSlackThreadActive(THREAD)).resolves.toBe(false);
    expect(kvDeleteMock).toHaveBeenCalledWith(THREAD_KEY);
  });

  it('should drop a subscription that has no usable expiry', async () => {
    kvGetMock.mockResolvedValue({});

    await expect(isSlackThreadActive(THREAD)).resolves.toBe(false);
    expect(kvDeleteMock).toHaveBeenCalledWith(THREAD_KEY);
  });
});
