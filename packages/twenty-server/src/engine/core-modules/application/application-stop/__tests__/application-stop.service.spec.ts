import { Test, type TestingModule } from '@nestjs/testing';

import {
  APPLICATION_KILL_SWITCH_LOCAL_CACHE_TTL_MS,
  ApplicationStopService,
} from 'src/engine/core-modules/application/application-stop/application-stop.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'application-universal-identifier-1';
const KILL_SWITCH_KEY = `kill-switch:${APPLICATION_UNIVERSAL_IDENTIFIER}`;

describe('ApplicationStopService', () => {
  let applicationStopService: ApplicationStopService;

  const cacheStorageService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationStopService,
        {
          provide: CacheStorageNamespace.ModuleApplications,
          useValue: cacheStorageService,
        },
      ],
    }).compile();

    applicationStopService = module.get(ApplicationStopService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sets the kill switch when stopping an application', async () => {
    await applicationStopService.stop(APPLICATION_UNIVERSAL_IDENTIFIER);

    expect(cacheStorageService.set).toHaveBeenCalledWith(
      KILL_SWITCH_KEY,
      'stopped',
    );
  });

  it('deletes the kill switch when removing it', async () => {
    await applicationStopService.remove(APPLICATION_UNIVERSAL_IDENTIFIER);

    expect(cacheStorageService.del).toHaveBeenCalledWith(KILL_SWITCH_KEY);
  });

  it('returns true when the kill switch exists', async () => {
    cacheStorageService.get.mockResolvedValue('stopped');

    await expect(
      applicationStopService.isApplicationStopped(
        APPLICATION_UNIVERSAL_IDENTIFIER,
      ),
    ).resolves.toBe(true);
    expect(cacheStorageService.get).toHaveBeenCalledWith(KILL_SWITCH_KEY);
  });

  it('returns false when the kill switch is absent', async () => {
    cacheStorageService.get.mockResolvedValue(undefined);

    await expect(
      applicationStopService.isApplicationStopped(
        APPLICATION_UNIVERSAL_IDENTIFIER,
      ),
    ).resolves.toBe(false);
  });

  it('caches the Redis value for one minute', async () => {
    const dateNow = jest.spyOn(Date, 'now').mockReturnValue(1_000);

    cacheStorageService.get
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('stopped');

    await expect(
      applicationStopService.isApplicationStopped(
        APPLICATION_UNIVERSAL_IDENTIFIER,
      ),
    ).resolves.toBe(false);

    dateNow.mockReturnValue(
      1_000 + APPLICATION_KILL_SWITCH_LOCAL_CACHE_TTL_MS - 1,
    );

    await expect(
      applicationStopService.isApplicationStopped(
        APPLICATION_UNIVERSAL_IDENTIFIER,
      ),
    ).resolves.toBe(false);
    expect(cacheStorageService.get).toHaveBeenCalledTimes(1);

    dateNow.mockReturnValue(1_000 + APPLICATION_KILL_SWITCH_LOCAL_CACHE_TTL_MS);

    await expect(
      applicationStopService.isApplicationStopped(
        APPLICATION_UNIVERSAL_IDENTIFIER,
      ),
    ).resolves.toBe(true);
    expect(cacheStorageService.get).toHaveBeenCalledTimes(2);
  });

  it('deduplicates concurrent Redis reads', async () => {
    cacheStorageService.get.mockResolvedValue(undefined);

    await Promise.all(
      Array.from({ length: 10 }, () =>
        applicationStopService.isApplicationStopped(
          APPLICATION_UNIVERSAL_IDENTIFIER,
        ),
      ),
    );

    expect(cacheStorageService.get).toHaveBeenCalledTimes(1);
  });

  it('fails open when the cache cannot be read', async () => {
    cacheStorageService.get.mockRejectedValue(new Error('Redis unavailable'));

    await expect(
      Promise.all([
        applicationStopService.isApplicationStopped(
          APPLICATION_UNIVERSAL_IDENTIFIER,
        ),
        applicationStopService.isApplicationStopped(
          APPLICATION_UNIVERSAL_IDENTIFIER,
        ),
      ]),
    ).resolves.toEqual([false, false]);
    expect(cacheStorageService.get).toHaveBeenCalledTimes(1);
  });
});
