import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_BOT_USER_ID_KV_KEY } from 'src/logic-functions/constants/slack-bot-user-id-kv-key';
import { SLACK_BOT_USER_ID_TTL_MS } from 'src/logic-functions/constants/slack-bot-user-id-ttl-ms';
import { resolveSlackBotUserIdOrThrow } from 'src/logic-functions/utils/resolve-slack-bot-user-id-or-throw';

const { authTestMock, getSlackClientMock, kvGetMock, kvSetMock, kvDeleteMock } =
  vi.hoisted(() => ({
    authTestMock: vi.fn(),
    getSlackClientMock: vi.fn(),
    kvGetMock: vi.fn(),
    kvSetMock: vi.fn(),
    kvDeleteMock: vi.fn(),
  }));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock, set: kvSetMock, delete: kvDeleteMock },
}));

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: getSlackClientMock,
}));

const BOT_USER_ID = 'UBOT';

const freshCacheEntry = () => ({
  botUserId: BOT_USER_ID,
  expiresAt: Date.now() + SLACK_BOT_USER_ID_TTL_MS,
});

describe('resolveSlackBotUserIdOrThrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    kvGetMock.mockResolvedValue(null);
    kvSetMock.mockResolvedValue(undefined);
    kvDeleteMock.mockResolvedValue(true);
    authTestMock.mockResolvedValue({ user_id: BOT_USER_ID });
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: { auth: { test: authTestMock } },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return the cached id without calling Slack', async () => {
    kvGetMock.mockResolvedValue(freshCacheEntry());

    const botUserId = await resolveSlackBotUserIdOrThrow();

    expect(botUserId).toBe(BOT_USER_ID);
    expect(getSlackClientMock).not.toHaveBeenCalled();
    expect(authTestMock).not.toHaveBeenCalled();
  });

  it('should fall back to auth.test when nothing is cached', async () => {
    const botUserId = await resolveSlackBotUserIdOrThrow();

    expect(botUserId).toBe(BOT_USER_ID);
    expect(authTestMock).toHaveBeenCalled();
  });

  it('should refetch rather than trust an expired entry', async () => {
    kvGetMock.mockResolvedValue({
      botUserId: 'USTALE',
      expiresAt: Date.now() - 1,
    });

    const botUserId = await resolveSlackBotUserIdOrThrow();

    expect(botUserId).toBe(BOT_USER_ID);
    expect(authTestMock).toHaveBeenCalled();
  });

  it('should refetch when the cached entry has no expiry', async () => {
    kvGetMock.mockResolvedValue({ botUserId: 'USTALE' });

    await expect(resolveSlackBotUserIdOrThrow()).resolves.toBe(BOT_USER_ID);
  });

  it('should fall back to auth.test when the cache read fails', async () => {
    kvGetMock.mockRejectedValue(new Error('kv unavailable'));

    const botUserId = await resolveSlackBotUserIdOrThrow();

    expect(botUserId).toBe(BOT_USER_ID);
    expect(authTestMock).toHaveBeenCalled();
  });

  it('should backfill the cache with an expiry after falling back', async () => {
    await resolveSlackBotUserIdOrThrow();

    expect(kvSetMock).toHaveBeenCalledWith(SLACK_BOT_USER_ID_KV_KEY, {
      botUserId: BOT_USER_ID,
      expiresAt: Date.now() + SLACK_BOT_USER_ID_TTL_MS,
    });
  });

  it('should drop the key when the cache write fails, rather than leave a stale id', async () => {
    kvSetMock.mockRejectedValue(new Error('kv unavailable'));

    await expect(resolveSlackBotUserIdOrThrow()).resolves.toBe(BOT_USER_ID);
    expect(kvDeleteMock).toHaveBeenCalledWith(SLACK_BOT_USER_ID_KV_KEY);
  });

  it('should throw when Slack is not connected and nothing is cached', async () => {
    getSlackClientMock.mockResolvedValue({
      success: false,
      error: 'Slack is not connected.',
    });

    await expect(resolveSlackBotUserIdOrThrow()).rejects.toThrow(
      'Slack is not connected.',
    );
  });

  it('should throw when auth.test returns no user id', async () => {
    authTestMock.mockResolvedValue({});

    await expect(resolveSlackBotUserIdOrThrow()).rejects.toThrow(
      'Slack auth.test returned no user_id for the bot',
    );
  });
});
