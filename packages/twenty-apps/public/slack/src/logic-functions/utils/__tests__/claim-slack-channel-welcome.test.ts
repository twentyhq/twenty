import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { claimSlackChannelWelcome } from 'src/logic-functions/utils/claim-slack-channel-welcome';

const { kvGetMock, kvSetMock } = vi.hoisted(() => ({
  kvGetMock: vi.fn(),
  kvSetMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock, set: kvSetMock },
}));

const NOW = new Date('2026-01-01T00:00:00.000Z').getTime();
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

describe('claimSlackChannelWelcome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should claim a channel that was never welcomed', async () => {
    kvGetMock.mockResolvedValue(null);

    const isFirstWelcome = await claimSlackChannelWelcome('C123');

    expect(isFirstWelcome).toBe(true);
    expect(kvGetMock).toHaveBeenCalledWith('slack-channel-welcome:C123');
    expect(kvSetMock).toHaveBeenCalledWith('slack-channel-welcome:C123', {
      expiresAt: NOW + THIRTY_DAYS_MS,
    });
  });

  it('should refuse a channel that is still within its welcome window', async () => {
    kvGetMock.mockResolvedValue({ expiresAt: NOW + 1000 });

    const isFirstWelcome = await claimSlackChannelWelcome('C123');

    expect(isFirstWelcome).toBe(false);
    expect(kvSetMock).not.toHaveBeenCalled();
  });

  it('should re-claim a channel whose welcome window has expired', async () => {
    kvGetMock.mockResolvedValue({ expiresAt: NOW - 1000 });

    const isFirstWelcome = await claimSlackChannelWelcome('C123');

    expect(isFirstWelcome).toBe(true);
    expect(kvSetMock).toHaveBeenCalledWith('slack-channel-welcome:C123', {
      expiresAt: NOW + THIRTY_DAYS_MS,
    });
  });

  it('should re-claim a channel whose stored claim has no usable expiry', async () => {
    kvGetMock.mockResolvedValue({ expiresAt: 'not-a-number' });

    const isFirstWelcome = await claimSlackChannelWelcome('C123');

    expect(isFirstWelcome).toBe(true);
    expect(kvSetMock).toHaveBeenCalled();
  });
});
