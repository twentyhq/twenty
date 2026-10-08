import { type Cache } from '@nestjs/cache-manager';

import { FlushCacheCommand } from 'src/engine/core-modules/cache-storage/commands/flush-cache.command';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('FlushCacheCommand', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    {
      prefix: '',
      expectedPattern: 'engine:workspace:flatObjectMetadataMaps:*',
    },
    {
      prefix: '{twenty-cache}',
      expectedPattern:
        '{twenty-cache}:engine:workspace:flatObjectMetadataMaps:*',
    },
  ])(
    'uses REDIS_CACHE_PREFIX "$prefix" when flushing',
    async ({ prefix, expectedPattern }) => {
      jest.replaceProperty(process, 'env', {
        ...process.env,
        NODE_ENV: 'production',
      });

      const client = {
        scan: jest.fn().mockResolvedValue({ cursor: 0, keys: [] }),
      };
      const twentyConfigService = { get: jest.fn().mockReturnValue(prefix) };
      const command = new FlushCacheCommand(
        { store: { name: 'redis', client } } as unknown as Cache,
        twentyConfigService as unknown as TwentyConfigService,
      );

      await command.run([], {
        namespace: CacheStorageNamespace.EngineWorkspace,
        pattern: 'flatObjectMetadataMaps:*',
      });

      expect(twentyConfigService.get).toHaveBeenCalledWith(
        'REDIS_CACHE_PREFIX',
      );
      expect(client.scan).toHaveBeenCalledWith(0, {
        MATCH: expectedPattern,
        COUNT: 100,
      });
    },
  );
});
