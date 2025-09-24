import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationResolver } from 'src/engine/core-modules/application/application.resolver';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { LocalApplicationSourceProvider } from 'src/engine/core-modules/application/providers/local-application-source.provider';
import { ApplicationSyncAgentService } from 'src/engine/core-modules/application/services/application-sync-agent.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/services/application-sync.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, AgentEntity, Workspace]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationV2Module,
    ObjectMetadataModule,
    DataSourceModule,
  ],
  providers: [
    ApplicationResolver,
    ApplicationService,
    ApplicationSyncService,
    ApplicationSyncAgentService,
    LocalApplicationSourceProvider,
  ],
  exports: [ApplicationService, ApplicationSyncService],
})
export class ApplicationModule {}
