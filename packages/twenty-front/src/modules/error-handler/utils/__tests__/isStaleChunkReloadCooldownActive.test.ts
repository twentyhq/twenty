import { STALE_CHUNK_RELOAD_TIMESTAMP_KEY } from '@/error-handler/constants/StaleChunkReloadTimestampKey';
import { isStaleChunkReloadCooldownActive } from '@/error-handler/utils/isStaleChunkReloadCooldownActive';

const NOW = 1_700_000_000_000;

describe('isStaleChunkReloadCooldownActive', () => {
  let dateNowSpy: jest.SpyInstance;

  beforeEach(() => {
    window.sessionStorage.clear();
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('should return false when no timestamp is stored', () => {
    expect(isStaleChunkReloadCooldownActive()).toBe(false);
  });

  it('should return true when the stored timestamp is within the cooldown', () => {
    window.sessionStorage.setItem(
      STALE_CHUNK_RELOAD_TIMESTAMP_KEY,
      (NOW - 10_000).toString(),
    );

    expect(isStaleChunkReloadCooldownActive()).toBe(true);
  });

  it('should return false when the stored timestamp is older than the cooldown', () => {
    window.sessionStorage.setItem(
      STALE_CHUNK_RELOAD_TIMESTAMP_KEY,
      (NOW - 61_000).toString(),
    );

    expect(isStaleChunkReloadCooldownActive()).toBe(false);
  });

  it('should return false when the stored timestamp is exactly as old as the cooldown', () => {
    window.sessionStorage.setItem(
      STALE_CHUNK_RELOAD_TIMESTAMP_KEY,
      (NOW - 60_000).toString(),
    );

    expect(isStaleChunkReloadCooldownActive()).toBe(false);
  });

  it('should return false when the stored value is not a number', () => {
    window.sessionStorage.setItem(
      STALE_CHUNK_RELOAD_TIMESTAMP_KEY,
      'not-a-timestamp',
    );

    expect(isStaleChunkReloadCooldownActive()).toBe(false);
  });

  it('should return true without throwing when sessionStorage access throws', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('sessionStorage access denied');
    });

    expect(isStaleChunkReloadCooldownActive()).toBe(true);
  });
});
