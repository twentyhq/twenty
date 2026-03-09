import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceFlatApplicationMapCacheService } from 'src/engine/core-modules/application/workspace-flat-application-map-cache.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, WorkspaceEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceCacheModule,
  ],
  exports: [ApplicationService, WorkspaceFlatApplicationMapCacheService],
  providers: [ApplicationService, WorkspaceFlatApplicationMapCacheService],
})
export class ApplicationModule {}
