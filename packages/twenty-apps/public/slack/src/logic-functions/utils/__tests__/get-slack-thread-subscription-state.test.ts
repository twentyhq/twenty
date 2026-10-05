import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getSlackThreadSubscriptionState } from 'src/logic-functions/utils/get-slack-thread-subscription-state';

const { kvGetMock, kvDeleteMock } = vi.hoisted(() => ({
  kvGetMock: vi.fn(),
  kvDeleteMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock, delete: kvDeleteMock },
}));

describe('getSlackThreadSubscriptionState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return none without reading the store when the reference is blank', async () => {
    const state = await getSlackThreadSubscriptionState({
      channelId: '',
      threadTimestamp: '1700000000.000100',
    });

    expect(state).toBe('none');
    expect(kvGetMock).not.toHaveBeenCalled();
  });

  it('should return none when no subscription is stored', async () => {
    kvGetMock.mockResolvedValue(null);

    const state = await getSlackThreadSubscriptionState({
      channelId: 'C123',
      threadTimestamp: '1700000000.000100',
    });

    expect(state).toBe('none');
    expect(kvDeleteMock).not.toHaveBeenCalled();
  });

  it('should return none when the stored subscription is malformed', async () => {
    kvGetMock.mockResolvedValue({});

    const state = await getSlackThreadSubscriptionState({
      channelId: 'C123',
      threadTimestamp: '1700000000.000100',
    });

    expect(state).toBe('none');
  });

  it('should return active while the subscription has not lapsed', async () => {
    kvGetMock.mockResolvedValue({ expiresAt: Date.now() + 60_000 });

    const state = await getSlackThreadSubscriptionState({
      channelId: 'C123',
      threadTimestamp: '1700000000.000100',
    });

    expect(state).toBe('active');
    expect(kvDeleteMock).not.toHaveBeenCalled();
  });

  it('should return expired without clearing the key when the subscription lapsed', async () => {
    kvGetMock.mockResolvedValue({ expiresAt: Date.now() - 60_000 });

    const state = await getSlackThreadSubscriptionState({
      channelId: 'C123',
      threadTimestamp: '1700000000.000100',
    });

    expect(state).toBe('expired');
    expect(kvDeleteMock).not.toHaveBeenCalled();
  });
});
