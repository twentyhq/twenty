import { Test, type TestingModule } from '@nestjs/testing';

import {
  APPLICATION_KILL_SWITCH_TTL_MS,
  ApplicationStopService,
} from 'src/engine/core-modules/application/application-stop.service';
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

  it('sets a temporary global kill switch', async () => {
    await applicationStopService.stopApplication({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(cacheStorageService.set).toHaveBeenCalledWith(
      KILL_SWITCH_KEY,
      true,
      APPLICATION_KILL_SWITCH_TTL_MS,
    );
  });

  it('removes the global kill switch', async () => {
    await applicationStopService.startApplication({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(cacheStorageService.del).toHaveBeenCalledWith(KILL_SWITCH_KEY);
  });

  it('returns true when the kill switch exists', async () => {
    cacheStorageService.get.mockResolvedValue('stopped');

    await expect(
      applicationStopService.isApplicationStopped(
        APPLICATION_UNIVERSAL_IDENTIFIER,
      ),
    ).resolves.toBe(true);
  });

  it('returns false when the kill switch is absent', async () => {
    cacheStorageService.get.mockResolvedValue(undefined);

    await expect(
      applicationStopService.isApplicationStopped(
        APPLICATION_UNIVERSAL_IDENTIFIER,
      ),
    ).resolves.toBe(false);
  });

  it('fails open when the cache cannot be read', async () => {
    cacheStorageService.get.mockRejectedValue(new Error('Redis unavailable'));

    await expect(
      applicationStopService.isApplicationStopped(
        APPLICATION_UNIVERSAL_IDENTIFIER,
      ),
    ).resolves.toBe(false);
  });
});
