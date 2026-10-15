import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationReachService } from 'src/engine/core-modules/authorization/application-reach/services/application-reach.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    WorkspaceCacheModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [ApplicationReachService],
  exports: [ApplicationReachService],
})
export class ApplicationReachModule {}
