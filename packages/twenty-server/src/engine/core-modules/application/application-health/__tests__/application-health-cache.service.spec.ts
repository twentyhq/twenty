import { ApplicationHealthStatus } from 'twenty-shared/application';

import { ApplicationHealthCacheService } from 'src/engine/core-modules/application/application-health/application-health-cache.service';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';

jest.mock(
  'src/engine/core-modules/cache-storage/services/cache-storage.service',
  () => ({ CacheStorageService: class {} }),
);

const application = {
  id: 'application-id',
  workspaceId: 'workspace-id',
  version: '1.0.0',
  healthCheckLogicFunctionId: 'health-check-id',
};

describe('ApplicationHealthCacheService', () => {
  const set = jest.fn();
  const mget = jest.fn();
  let service: ApplicationHealthCacheService;

  beforeEach(() => {
    jest.clearAllMocks();
    set.mockResolvedValue(undefined);
    mget.mockResolvedValue([ApplicationHealthStatus.ERROR]);
    service = new ApplicationHealthCacheService({
      set,
      mget,
    } as unknown as CacheStorageService);
  });

  it('retains results for 24 hours and isolates results by workspace, version, and health-check function', async () => {
    await service.record(application, ApplicationHealthStatus.ERROR);
    await service.getStatuses([application]);

    const key = set.mock.calls[0][0];
    expect(set).toHaveBeenCalledWith(
      key,
      ApplicationHealthStatus.ERROR,
      24 * 60 * 60 * 1000,
    );
    expect(mget).toHaveBeenCalledWith([key]);

    for (const updated of [
      { ...application, workspaceId: 'another-workspace' },
      { ...application, version: '2.0.0' },
      { ...application, healthCheckLogicFunctionId: 'another-health-check' },
    ]) {
      await service.getStatuses([updated]);
      expect(mget.mock.calls[mget.mock.calls.length - 1]?.[0][0]).not.toBe(key);
    }
  });

  it('leaves health unknown when the cache cannot be read', async () => {
    mget.mockRejectedValue(new Error('Cache unavailable'));

    expect(await service.getStatuses([application])).toEqual([undefined]);
  });

  it('does not fail a health check when recording its result fails', async () => {
    set.mockRejectedValue(new Error('Cache unavailable'));

    await expect(
      service.record(application, ApplicationHealthStatus.OK),
    ).resolves.toBeUndefined();
  });

  it('does not issue an empty multi-get', async () => {
    expect(await service.getStatuses([])).toEqual([]);
    expect(mget).not.toHaveBeenCalled();
  });
});
