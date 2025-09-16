import { Module } from '@nestjs/common';

import { FlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/flat-entity-maps-cache.service';
import { WorkspaceFlatMapCacheModule } from 'src/engine/workspace-flat-map-cache/workspace-flat-map-cache.module';

@Module({
  imports: [WorkspaceFlatMapCacheModule],
  providers: [FlatEntityMapsCacheService],
  exports: [FlatEntityMapsCacheService],
})
export class FlatEntityMapsCacheModule {}
