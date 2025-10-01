import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationResolver } from 'src/engine/core-modules/application/application.resolver';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-sync.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { AgentModule } from 'src/engine/metadata-modules/agent/agent.module';
import { ServerlessFunctionLayerModule } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, AgentEntity, Workspace]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ObjectMetadataModule,
    DataSourceModule,
    AgentModule,
    ServerlessFunctionLayerModule,
  ],
  providers: [ApplicationResolver, ApplicationService, ApplicationSyncService],
})
export class ApplicationModule {}
