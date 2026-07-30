import { type DiscoveryService, type Reflector } from '@nestjs/core';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';

describe('CoreEntityCacheService', () => {
  let service: CoreEntityCacheService;

  beforeEach(() => {
    jest.useFakeTimers();

    service = new CoreEntityCacheService(
      {} as CacheStorageService,
      {} as DiscoveryService,
      {} as Reflector,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should run the local cache expiration sweep at most once per minute', async () => {
    const expirationSweepSpy = jest.spyOn(
      service as unknown as {
        evictExpiredLocalEntries: (now: number) => void;
      },
      'evictExpiredLocalEntries',
    );

    await expect(
      service.get('workspaceEntity', 'invalid-entity-id'),
    ).resolves.toBeNull();
    await expect(
      service.get('workspaceEntity', 'invalid-entity-id'),
    ).resolves.toBeNull();

    expect(expirationSweepSpy).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(60_000);

    await expect(
      service.get('workspaceEntity', 'invalid-entity-id'),
    ).resolves.toBeNull();

    expect(expirationSweepSpy).toHaveBeenCalledTimes(2);
  });
});
