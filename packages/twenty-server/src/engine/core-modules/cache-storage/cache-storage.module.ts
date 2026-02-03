import { CACHE_MANAGER, Cache, CacheModule } from '@nestjs/cache-manager';
import { Global, Inject, Module, type OnModuleDestroy } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { cacheStorageModuleFactory } from 'src/engine/core-modules/cache-storage/cache-storage.module-factory';
import { FlushCacheCommand } from 'src/engine/core-modules/cache-storage/commands/flush-cache.command';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: cacheStorageModuleFactory,
      inject: [TwentyConfigService],
    }),
  ],
  providers: [
    ...Object.values(CacheStorageNamespace).map((cacheStorageNamespace) => ({
      provide: cacheStorageNamespace,
      useFactory: (cacheManager: Cache) => {
        return new CacheStorageService(cacheManager, cacheStorageNamespace);
      },
      inject: [CACHE_MANAGER],
    })),
    FlushCacheCommand,
  ],
  exports: [...Object.values(CacheStorageNamespace), FlushCacheCommand],
})
export class CacheStorageModule implements OnModuleDestroy {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async onModuleDestroy() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((this.cacheManager.store as any)?.name === 'redis') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (this.cacheManager.store as any).client.quit();
    }
  }
}
