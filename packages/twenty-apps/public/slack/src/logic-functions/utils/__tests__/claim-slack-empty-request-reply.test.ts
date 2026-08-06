import { beforeEach, describe, expect, it, vi } from 'vitest';

import { claimSlackEmptyRequestReply } from 'src/logic-functions/utils/claim-slack-empty-request-reply';

const { kvGetMock, kvSetMock } = vi.hoisted(() => ({
  kvGetMock: vi.fn(),
  kvSetMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock, set: kvSetMock },
}));

const MESSAGE_REFERENCE = {
  slackChannelId: 'C123',
  slackMessageTimestamp: '1700000000.000100',
};

const EXPECTED_KEY = 'slack-empty-request-reply:C123:1700000000.000100';

describe('claimSlackEmptyRequestReply', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should claim the reply when nothing is stored yet', async () => {
    kvGetMock.mockResolvedValue(null);

    const isFirstReply = await claimSlackEmptyRequestReply(MESSAGE_REFERENCE);

    expect(isFirstReply).toBe(true);
    expect(kvGetMock).toHaveBeenCalledWith(EXPECTED_KEY);
    expect(kvSetMock).toHaveBeenCalledWith(EXPECTED_KEY, {
      expiresAt: expect.any(Number),
    });
  });

  it('should refuse the claim while a previous one is still live', async () => {
    kvGetMock.mockResolvedValue({ expiresAt: Date.now() + 60_000 });

    const isFirstReply = await claimSlackEmptyRequestReply(MESSAGE_REFERENCE);

    expect(isFirstReply).toBe(false);
    expect(kvSetMock).not.toHaveBeenCalled();
  });

  it('should claim again once the previous claim has lapsed', async () => {
    kvGetMock.mockResolvedValue({ expiresAt: Date.now() - 60_000 });

    const isFirstReply = await claimSlackEmptyRequestReply(MESSAGE_REFERENCE);

    expect(isFirstReply).toBe(true);
    expect(kvSetMock).toHaveBeenCalled();
  });

  it('should claim when the stored claim is malformed', async () => {
    kvGetMock.mockResolvedValue({});

    const isFirstReply = await claimSlackEmptyRequestReply(MESSAGE_REFERENCE);

    expect(isFirstReply).toBe(true);
    expect(kvSetMock).toHaveBeenCalled();
  });
});
