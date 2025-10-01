import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.service.';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { WorkspaceFlatMapCacheModule } from 'src/engine/workspace-flat-map-cache/workspace-flat-map-cache.module';

@Module({
  imports: [
    WorkspaceFlatMapCacheModule,
    WorkspaceMetadataVersionModule,
    WorkspacePermissionsCacheModule,
  ],
  providers: [WorkspaceManyOrAllFlatEntityMapsCacheService],
  exports: [WorkspaceManyOrAllFlatEntityMapsCacheService],
})
export class WorkspaceManyOrAllFlatEntityMapsCacheModule {}
