import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

@Command({
  name: 'cache:flush',
  description: 'Flush cache for specific keys matching the pattern',
})
export class FlushCacheCommand extends CommandRunner {
  private readonly logger = new Logger(FlushCacheCommand.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorage: CacheStorageService,
  ) {
    super();
  }

  async run(
    _passedParams: string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: Record<string, any>,
  ): Promise<void> {
    const pattern = options?.pattern || '*';

    this.logger.log(`Flushing cache for pattern: ${pattern}...`);

    if (pattern === '*') {
      await this.cacheStorage.flush();
    } else {
      await this.cacheStorage.flushByPattern(pattern);
    }

    this.logger.log('Cache flushed');
  }

  @Option({
    flags: '-p, --pattern <pattern>',
    description: 'Pattern to flush specific cache keys (e.g., engine:*)',
  })
  parsePattern(val: string): string {
    return val;
  }
}
