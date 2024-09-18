import { CACHE_MANAGER, Cache, CacheModule } from '@nestjs/cache-manager';
import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { cacheStorageModuleFactory } from 'src/engine/core-modules/cache-storage/cache-storage.module-factory';
import { FlushCacheCommand } from 'src/engine/core-modules/cache-storage/commands/flush-cache.command';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: cacheStorageModuleFactory,
      inject: [EnvironmentService],
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
    if ((this.cacheManager.store as any)?.name === 'redis') {
      await (this.cacheManager.store as any).client.quit();
    }
  }
}
