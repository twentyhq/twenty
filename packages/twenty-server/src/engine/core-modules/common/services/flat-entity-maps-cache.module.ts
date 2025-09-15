import { Module } from '@nestjs/common';

import { FlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/flat-entity-maps-cache.service';
import { ViewCacheModule } from 'src/engine/core-modules/view/cache/services/view-cache.module';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';

@Module({
  imports: [ViewCacheModule, WorkspaceMetadataCacheModule],
  exports: [FlatEntityMapsCacheService],
  providers: [FlatEntityMapsCacheService],
})
export class FlatEntityMapsCacheModule {}
