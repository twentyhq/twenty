import { shouldTriggerStaleChunkReload } from '@/error-handler/utils/shouldTriggerStaleChunkReload';

const STALE_CHUNK_RELOAD_TIMESTAMP_KEY = 'staleChunkReloadTimestamp';
const NOW = 1_700_000_000_000;

describe('shouldTriggerStaleChunkReload', () => {
  let dateNowSpy: jest.SpyInstance;

  beforeEach(() => {
    window.sessionStorage.clear();
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('should return true and store the current timestamp when no timestamp is stored', () => {
    const result = shouldTriggerStaleChunkReload();

    expect(result).toBe(true);
    expect(
      window.sessionStorage.getItem(STALE_CHUNK_RELOAD_TIMESTAMP_KEY),
    ).toBe(NOW.toString());
  });

  it('should return false when the stored timestamp is within the cooldown', () => {
    const tenSecondsAgo = NOW - 10_000;
    window.sessionStorage.setItem(
      STALE_CHUNK_RELOAD_TIMESTAMP_KEY,
      tenSecondsAgo.toString(),
    );

    const result = shouldTriggerStaleChunkReload();

    expect(result).toBe(false);
    expect(
      window.sessionStorage.getItem(STALE_CHUNK_RELOAD_TIMESTAMP_KEY),
    ).toBe(tenSecondsAgo.toString());
  });

  it('should return true and refresh the timestamp when the stored timestamp is older than the cooldown', () => {
    window.sessionStorage.setItem(
      STALE_CHUNK_RELOAD_TIMESTAMP_KEY,
      (NOW - 61_000).toString(),
    );

    const result = shouldTriggerStaleChunkReload();

    expect(result).toBe(true);
    expect(
      window.sessionStorage.getItem(STALE_CHUNK_RELOAD_TIMESTAMP_KEY),
    ).toBe(NOW.toString());
  });

  it('should return true when the stored timestamp is exactly as old as the cooldown', () => {
    window.sessionStorage.setItem(
      STALE_CHUNK_RELOAD_TIMESTAMP_KEY,
      (NOW - 60_000).toString(),
    );

    const result = shouldTriggerStaleChunkReload();

    expect(result).toBe(true);
  });

  it('should return true when the stored value is not a number', () => {
    window.sessionStorage.setItem(
      STALE_CHUNK_RELOAD_TIMESTAMP_KEY,
      'not-a-timestamp',
    );

    const result = shouldTriggerStaleChunkReload();

    expect(result).toBe(true);
    expect(
      window.sessionStorage.getItem(STALE_CHUNK_RELOAD_TIMESTAMP_KEY),
    ).toBe(NOW.toString());
  });

  it('should return false without throwing when sessionStorage access throws', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('sessionStorage access denied');
    });

    const result = shouldTriggerStaleChunkReload();

    expect(result).toBe(false);
  });
});
