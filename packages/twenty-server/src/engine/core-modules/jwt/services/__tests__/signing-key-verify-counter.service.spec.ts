import { SIGNING_KEY_USAGE_TTL_MS } from 'src/engine/core-modules/jwt/constants/signing-key-usage.constant';
import { SigningKeyVerifyCounterService } from 'src/engine/core-modules/jwt/services/signing-key-verify-counter.service';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

describe('SigningKeyVerifyCounterService', () => {
  let service: SigningKeyVerifyCounterService;
  let store: Map<string, number>;
  let cacheStorageMock: {
    incrBy: jest.Mock;
    expire: jest.Mock;
    mget: jest.Mock;
  };

  beforeEach(() => {
    store = new Map();
    cacheStorageMock = {
      incrBy: jest.fn(async (key: string, increment: number) => {
        const next = (store.get(key) ?? 0) + increment;

        store.set(key, next);

        return next;
      }),
      expire: jest.fn(async () => true),
      mget: jest.fn(async (keys: string[]) =>
        keys.map((key) => store.get(key)),
      ),
    };
    service = new SigningKeyVerifyCounterService(cacheStorageMock as never);
  });

  it('increments and reads back the count for the current bucket', async () => {
    const kid = 'kid-1';
    const now = Date.UTC(2026, 0, 15, 12, 0, 0);

    await service.recordVerify(kid, now);
    await service.recordVerify(kid, now);
    await service.recordVerify(kid, now);

    expect(cacheStorageMock.expire).toHaveBeenCalledWith(
      expect.any(String),
      SIGNING_KEY_USAGE_TTL_MS,
    );

    const count = await service.getCountInWindow(kid, now);

    expect(count).toBe(3);
  });

  it('sums counts across the 7-day window and excludes older buckets', async () => {
    const kid = 'kid-1';
    const now = Date.UTC(2026, 0, 15, 12, 0, 0);

    for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
      await service.recordVerify(kid, now - dayOffset * ONE_DAY_MS);
    }

    const count = await service.getCountInWindow(kid, now);

    expect(count).toBe(7);
  });

  it('keeps counts per identifier isolated', async () => {
    const now = Date.now();

    await service.recordVerify('kid-1', now);
    await service.recordVerify('kid-1', now);
    await service.recordVerify('kid-2', now);
    await service.recordVerify('legacy', now);

    const counts = await service.getCountsInWindow(
      ['kid-1', 'kid-2', 'legacy', 'kid-3'],
      now,
    );

    expect(counts['kid-1']).toBe(2);
    expect(counts['kid-2']).toBe(1);
    expect(counts['legacy']).toBe(1);
    expect(counts['kid-3']).toBe(0);
  });

  it('returns an empty object when no identifiers are requested', async () => {
    const counts = await service.getCountsInWindow([], Date.now());

    expect(counts).toEqual({});
    expect(cacheStorageMock.mget).not.toHaveBeenCalled();
  });

  it('does not throw if the cache storage rejects on increment', async () => {
    cacheStorageMock.incrBy.mockRejectedValueOnce(new Error('redis is down'));

    await expect(service.recordVerify('kid-1')).resolves.toBeUndefined();
  });

  it('returns 0 when reading a single identifier and the cache storage throws', async () => {
    cacheStorageMock.mget.mockRejectedValueOnce(new Error('redis is down'));

    await expect(service.getCountInWindow('kid-1')).resolves.toBe(0);
  });

  it('returns zeroed counts when bulk reading and the cache storage throws', async () => {
    cacheStorageMock.mget.mockRejectedValueOnce(new Error('redis is down'));

    const counts = await service.getCountsInWindow(['kid-1', 'kid-2']);

    expect(counts).toEqual({ 'kid-1': 0, 'kid-2': 0 });
  });
});
