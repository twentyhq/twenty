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
    kvGetMock.mockResolvedValue({
      keys: CACHED_KEYS,
      fetchedAtMs: Date.now() - 23 * 60 * 60 * 1000,
    });

    expect(await getTeamsBotConnectorKeys()).toEqual(CACHED_KEYS);
    expect(fetchKeysMock).not.toHaveBeenCalled();
  });

  it('should fetch and cache when nothing is stored', async () => {
    kvGetMock.mockResolvedValue(null);

    expect(await getTeamsBotConnectorKeys()).toEqual(FETCHED_KEYS);
    expect(kvSetMock).toHaveBeenCalledWith(TEAMS_BOT_CONNECTOR_KEYS_KV_KEY, {
      keys: FETCHED_KEYS,
      fetchedAtMs: Date.now(),
    });
  });

  it('should fetch again once the cached key set is a day old', async () => {
    kvGetMock.mockResolvedValue({
      keys: CACHED_KEYS,
      fetchedAtMs: Date.now() - 25 * 60 * 60 * 1000,
    });

    expect(await getTeamsBotConnectorKeys()).toEqual(FETCHED_KEYS);
  });

  it('should honour a forced refresh when the cache is older than the refresh interval', async () => {
    kvGetMock.mockResolvedValue({
      keys: CACHED_KEYS,
      fetchedAtMs: Date.now() - 10 * 60 * 1000,
    });

    expect(await getTeamsBotConnectorKeys({ forceRefresh: true })).toEqual(
      FETCHED_KEYS,
    );
  });

  it('should rate limit forced refreshes to the refresh interval', async () => {
    kvGetMock.mockResolvedValue({
      keys: CACHED_KEYS,
      fetchedAtMs: Date.now() - 60 * 1000,
    });

    expect(await getTeamsBotConnectorKeys({ forceRefresh: true })).toEqual(
      CACHED_KEYS,
    );
    expect(fetchKeysMock).not.toHaveBeenCalled();
  });
});
