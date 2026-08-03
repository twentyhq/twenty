import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveSlackBotUserId } from 'src/logic-functions/utils/resolve-slack-bot-user-id';

const { authTestMock, getSlackClientMock, kvGetMock, kvSetMock } = vi.hoisted(
  () => ({
    authTestMock: vi.fn(),
    getSlackClientMock: vi.fn(),
    kvGetMock: vi.fn(),
    kvSetMock: vi.fn(),
  }),
);

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock, set: kvSetMock },
}));

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: getSlackClientMock,
}));

const BOT_USER_ID = 'UBOT';

describe('resolveSlackBotUserId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    kvGetMock.mockResolvedValue(null);
    kvSetMock.mockResolvedValue(undefined);
    authTestMock.mockResolvedValue({ user_id: BOT_USER_ID });
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: { auth: { test: authTestMock } },
    });
  });

  it('should return the cached id without calling Slack', async () => {
    kvGetMock.mockResolvedValue(BOT_USER_ID);

    const botUserId = await resolveSlackBotUserId();

    expect(botUserId).toBe(BOT_USER_ID);
    expect(getSlackClientMock).not.toHaveBeenCalled();
    expect(authTestMock).not.toHaveBeenCalled();
  });

  it('should fall back to auth.test when nothing is cached', async () => {
    const botUserId = await resolveSlackBotUserId();

    expect(botUserId).toBe(BOT_USER_ID);
    expect(authTestMock).toHaveBeenCalled();
  });

  it('should backfill the cache after falling back', async () => {
    await resolveSlackBotUserId();

    expect(kvSetMock).toHaveBeenCalledWith('slack-bot-user-id', BOT_USER_ID);
  });

  it('should ignore an empty cached value and refetch', async () => {
    kvGetMock.mockResolvedValue('');

    const botUserId = await resolveSlackBotUserId();

    expect(botUserId).toBe(BOT_USER_ID);
    expect(authTestMock).toHaveBeenCalled();
  });

  it('should throw when Slack is not connected and nothing is cached', async () => {
    getSlackClientMock.mockResolvedValue({
      success: false,
      error: 'Slack is not connected.',
    });

    await expect(resolveSlackBotUserId()).rejects.toThrow(
      'Slack is not connected.',
    );
  });

  it('should throw when auth.test returns no user id', async () => {
    authTestMock.mockResolvedValue({});

    await expect(resolveSlackBotUserId()).rejects.toThrow(
      'Slack auth.test returned no user_id for the bot',
    );
  });

  it('should still resolve when backfilling the cache fails', async () => {
    kvSetMock.mockRejectedValue(new Error('kv unavailable'));

    await expect(resolveSlackBotUserId()).resolves.toBe(BOT_USER_ID);
  });
});
