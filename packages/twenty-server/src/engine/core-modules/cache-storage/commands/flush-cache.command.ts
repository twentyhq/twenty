import { Logger } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

// TODO: implement dry-run
@Command({
  name: 'cache:flush',
  description: 'Completely flush cache',
})
export class FlushCacheCommand extends CommandRunner {
  private readonly logger = new Logger(FlushCacheCommand.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorage: CacheStorageService,
  ) {
    super();
  }

  async run(): Promise<void> {
    this.logger.log('Flushing cache...');
    await this.cacheStorage.flush();
    this.logger.log('Cache flushed');
  }
}
