import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { WorkspaceFlatMapCacheModule } from 'src/engine/workspace-flat-map-cache/workspace-flat-map-cache.module';

@Module({
  imports: [WorkspaceFlatMapCacheModule],
  providers: [WorkspaceManyOrAllFlatEntityMapsCacheService],
  exports: [WorkspaceManyOrAllFlatEntityMapsCacheService],
})
export class WorkspaceManyOrAllFlatEntityMapsCacheModule {}
