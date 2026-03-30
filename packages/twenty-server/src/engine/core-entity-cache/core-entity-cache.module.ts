import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';

@Module({
  imports: [CacheStorageModule, DiscoveryModule],
  providers: [CoreEntityCacheService],
  exports: [CoreEntityCacheService],
})
export class CoreEntityCacheModule {}
