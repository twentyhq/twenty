import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';

@Module({
  imports: [DiscoveryModule],
  providers: [CoreEntityCacheService],
  exports: [CoreEntityCacheService],
})
export class CoreEntityCacheModule {}
