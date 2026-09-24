import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEAMS_BOT_CONNECTOR_KEYS_KV_KEY } from 'src/features/chat/logic-functions/constants/teams-bot-connector-keys-kv-key';
import { getTeamsBotConnectorKeys } from 'src/features/chat/logic-functions/utils/get-teams-bot-connector-keys';

const { kvGetMock, kvSetMock, fetchKeysMock } = vi.hoisted(() => ({
  kvGetMock: vi.fn(),
  kvSetMock: vi.fn(),
  fetchKeysMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock, set: kvSetMock },
}));

vi.mock(
  'src/features/chat/logic-functions/utils/fetch-teams-bot-connector-keys',
  () => ({
    fetchTeamsBotConnectorKeys: fetchKeysMock,
  }),
);

const CACHED_KEYS = [{ kid: 'cached', kty: 'RSA' }];
const FETCHED_KEYS = [{ kid: 'fetched', kty: 'RSA' }];

const cacheEntry = ({
  fetchedAgoMs,
  refreshAttemptedAgoMs = fetchedAgoMs,
}: {
  fetchedAgoMs: number;
  refreshAttemptedAgoMs?: number;
}) => ({
  keys: CACHED_KEYS,
  fetchedAtMs: Date.now() - fetchedAgoMs,
  refreshAttemptedAtMs: Date.now() - refreshAttemptedAgoMs,
});

describe('getTeamsBotConnectorKeys', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    fetchKeysMock.mockResolvedValue(FETCHED_KEYS);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should reuse a key set fetched within the last day', async () => {
    kvGetMock.mockResolvedValue(
      cacheEntry({ fetchedAgoMs: 23 * 60 * 60 * 1000 }),
    );

    expect(await getTeamsBotConnectorKeys()).toEqual(CACHED_KEYS);
    expect(fetchKeysMock).not.toHaveBeenCalled();
    expect(kvSetMock).not.toHaveBeenCalled();
  });

  it('should fetch and cache when nothing is stored', async () => {
    kvGetMock.mockResolvedValue(null);

    expect(await getTeamsBotConnectorKeys()).toEqual(FETCHED_KEYS);
    expect(kvSetMock).toHaveBeenCalledTimes(1);
    expect(kvSetMock).toHaveBeenCalledWith(TEAMS_BOT_CONNECTOR_KEYS_KV_KEY, {
      keys: FETCHED_KEYS,
      fetchedAtMs: Date.now(),
      refreshAttemptedAtMs: Date.now(),
    });
  });

  it('should stamp the refresh attempt before fetching once the cached key set is a day old', async () => {
    const staleEntry = cacheEntry({ fetchedAgoMs: 25 * 60 * 60 * 1000 });

    kvGetMock.mockResolvedValue(staleEntry);

    expect(await getTeamsBotConnectorKeys()).toEqual(FETCHED_KEYS);
    expect(kvSetMock).toHaveBeenNthCalledWith(
      1,
      TEAMS_BOT_CONNECTOR_KEYS_KV_KEY,
      { ...staleEntry, refreshAttemptedAtMs: Date.now() },
    );
    expect(kvSetMock).toHaveBeenNthCalledWith(
      2,
      TEAMS_BOT_CONNECTOR_KEYS_KV_KEY,
      {
        keys: FETCHED_KEYS,
        fetchedAtMs: Date.now(),
        refreshAttemptedAtMs: Date.now(),
      },
    );
  });

  it('should honour a forced refresh when the last attempt is older than the refresh interval', async () => {
    kvGetMock.mockResolvedValue(cacheEntry({ fetchedAgoMs: 10 * 60 * 1000 }));

    expect(await getTeamsBotConnectorKeys({ forceRefresh: true })).toEqual(
      FETCHED_KEYS,
    );
  });

  it('should rate limit forced refreshes on the last attempt, not on the last successful fetch', async () => {
    kvGetMock.mockResolvedValue(
      cacheEntry({
        fetchedAgoMs: 10 * 60 * 1000,
        refreshAttemptedAgoMs: 60 * 1000,
      }),
    );

    expect(await getTeamsBotConnectorKeys({ forceRefresh: true })).toEqual(
      CACHED_KEYS,
    );
    expect(fetchKeysMock).not.toHaveBeenCalled();
    expect(kvSetMock).not.toHaveBeenCalled();
  });

  it('should keep serving the last good key set when the fetch fails', async () => {
    kvGetMock.mockResolvedValue(
      cacheEntry({ fetchedAgoMs: 25 * 60 * 60 * 1000 }),
    );
    fetchKeysMock.mockRejectedValue(new Error('upstream down'));

    expect(await getTeamsBotConnectorKeys()).toEqual(CACHED_KEYS);
    expect(kvSetMock).toHaveBeenCalledTimes(1);
  });

  it('should surface a failed fetch when there is no key set to fall back on', async () => {
    kvGetMock.mockResolvedValue(null);
    fetchKeysMock.mockRejectedValue(new Error('upstream down'));

    await expect(getTeamsBotConnectorKeys()).rejects.toThrow('upstream down');
  });
});
