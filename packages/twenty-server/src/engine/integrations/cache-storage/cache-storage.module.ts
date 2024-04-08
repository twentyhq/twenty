import { Module, Global, Inject, OnModuleDestroy } from '@nestjs/common';
import { CacheModule, CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';

import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { cacheStorageModuleFactory } from 'src/engine/integrations/cache-storage/cache-storage.module-factory';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';

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
  ],
  exports: [...Object.values(CacheStorageNamespace)],
})
export class CacheStorageModule implements OnModuleDestroy {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async onModuleDestroy() {
    if ((this.cacheManager.store as any)?.name === 'redis') {
      await (this.cacheManager.store as any).client.quit();
    }
  }
}
