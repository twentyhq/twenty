import { Test, type TestingModule } from '@nestjs/testing';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { CronTriggerDeduplicationService } from 'src/engine/core-modules/cron/services/cron-trigger-deduplication.service';

describe('CronTriggerDeduplicationService', () => {
  let service: CronTriggerDeduplicationService;
  const cacheStorageService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const pattern = '*/5 * * * *';
  const dueNow = new Date('2025-01-01T10:00:00.100Z');
  const notDueNow = new Date('2025-01-01T10:01:30.100Z');

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronTriggerDeduplicationService,
        {
          provide: CacheStorageNamespace.EngineLock,
          useValue: cacheStorageService,
        },
      ],
    }).compile();

    service = module.get(CronTriggerDeduplicationService);
  });

  it('returns false and never touches the cache when the pattern is not due', async () => {
    expect(await service.shouldDispatch('key', pattern, notDueNow)).toBe(false);
    expect(cacheStorageService.get).not.toHaveBeenCalled();
    expect(cacheStorageService.set).not.toHaveBeenCalled();
  });

  it('returns true and claims the trigger when due and unclaimed', async () => {
    cacheStorageService.get.mockResolvedValue(undefined);

    expect(await service.shouldDispatch('key', pattern, dueNow)).toBe(true);

    const triggerTimestamp = new Date('2025-01-01T10:00:00.000Z').getTime();

    expect(cacheStorageService.set).toHaveBeenCalledWith(
      `key:${triggerTimestamp}`,
      true,
      expect.any(Number),
    );
  });

  it('returns false without re-claiming when the trigger is already claimed', async () => {
    cacheStorageService.get.mockResolvedValue(true);

    expect(await service.shouldDispatch('key', pattern, dueNow)).toBe(false);
    expect(cacheStorageService.set).not.toHaveBeenCalled();
  });
});
