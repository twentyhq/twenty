import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicationKeyValueStoreQuotaExceededError } from 'src/engine/core-modules/application/key-value-store/errors/application-key-value-store-quota-exceeded.error';
import { ApplicationKeyValueStoreService } from 'src/engine/core-modules/application/key-value-store/services/application-key-value-store.service';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const scope = { applicationId: 'app-1', workspaceId: 'ws-1' };

describe('ApplicationKeyValueStoreService', () => {
  let service: ApplicationKeyValueStoreService;
  let cacheStorageService: jest.Mocked<CacheStorageService>;
  let twentyConfigService: jest.Mocked<TwentyConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationKeyValueStoreService,
        {
          provide: CacheStorageNamespace.EngineApplicationKeyValue,
          useValue: {
            getString: jest.fn(),
            setString: jest.fn(),
            getStringLength: jest.fn(),
            scanAndSumStringLengths: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(ApplicationKeyValueStoreService);
    cacheStorageService = module.get(
      CacheStorageNamespace.EngineApplicationKeyValue,
    );
    twentyConfigService = module.get(TwentyConfigService);
  });

  describe('get', () => {
    it('returns { value } when the key exists', async () => {
      cacheStorageService.getString.mockResolvedValue('cached');

      await expect(service.get(scope, 'key')).resolves.toEqual({
        value: 'cached',
      });
      expect(cacheStorageService.getString).toHaveBeenCalledWith(
        'ws-1:app-1:key',
      );
    });

    it('returns null when the key is absent', async () => {
      cacheStorageService.getString.mockResolvedValue(null);

      await expect(service.get(scope, 'key')).resolves.toBeNull();
    });
  });

  describe('set', () => {
    beforeEach(() => {
      twentyConfigService.get.mockReturnValue(100);
    });

    it('stores the value when below the quota', async () => {
      cacheStorageService.scanAndSumStringLengths.mockResolvedValue(10);
      cacheStorageService.getStringLength.mockResolvedValue(0);

      await service.set(scope, 'key', 'value', 60);

      expect(cacheStorageService.setString).toHaveBeenCalledWith(
        'ws-1:app-1:key',
        'value',
        60_000,
      );
    });

    it('passes no ttl when ttlInSeconds is omitted', async () => {
      cacheStorageService.scanAndSumStringLengths.mockResolvedValue(0);
      cacheStorageService.getStringLength.mockResolvedValue(0);

      await service.set(scope, 'key', 'value');

      expect(cacheStorageService.setString).toHaveBeenCalledWith(
        'ws-1:app-1:key',
        'value',
        undefined,
      );
    });

    it('excludes the overwritten entry size from the projected total', async () => {
      // total already at quota, but the existing entry (95 bytes) is being
      // replaced by a 5-byte value, so it fits.
      cacheStorageService.scanAndSumStringLengths.mockResolvedValue(100);
      cacheStorageService.getStringLength.mockResolvedValue(95);

      await service.set(scope, 'key', 'value');

      expect(cacheStorageService.setString).toHaveBeenCalled();
    });

    it('throws when the projected total exceeds the quota', async () => {
      cacheStorageService.scanAndSumStringLengths.mockResolvedValue(98);
      cacheStorageService.getStringLength.mockResolvedValue(0);

      await expect(service.set(scope, 'key', 'value')).rejects.toBeInstanceOf(
        ApplicationKeyValueStoreQuotaExceededError,
      );
      expect(cacheStorageService.setString).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes the scoped entry key', async () => {
      await service.delete(scope, 'key');

      expect(cacheStorageService.del).toHaveBeenCalledWith('ws-1:app-1:key');
    });
  });
});
