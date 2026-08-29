import { STALE_CHUNK_RELOAD_TIMESTAMP_KEY } from '@/error-handler/constants/StaleChunkReloadTimestampKey';
import { storeStaleChunkReloadTimestamp } from '@/error-handler/utils/storeStaleChunkReloadTimestamp';

const NOW = 1_700_000_000_000;

describe('storeStaleChunkReloadTimestamp', () => {
  let dateNowSpy: jest.SpyInstance;

  beforeEach(() => {
    window.sessionStorage.clear();
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('should store the current timestamp and return true', () => {
    const result = storeStaleChunkReloadTimestamp();

    expect(result).toBe(true);
    expect(
      window.sessionStorage.getItem(STALE_CHUNK_RELOAD_TIMESTAMP_KEY),
    ).toBe(NOW.toString());
  });

  it('should return false without throwing when sessionStorage access throws', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('sessionStorage access denied');
    });

    expect(storeStaleChunkReloadTimestamp()).toBe(false);
  });
});
