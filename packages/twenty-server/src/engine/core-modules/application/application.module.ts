import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationSyncService } from 'src/engine/core-modules/application/application-sync.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationResolver } from 'src/engine/core-modules/application/application.resolver';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationVariableEntityModule } from 'src/engine/core-modules/applicationVariable/application-variable.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { CronTriggerModule } from 'src/engine/metadata-modules/cron-trigger/cron-trigger.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { DatabaseEventTriggerModule } from 'src/engine/metadata-modules/database-event-trigger/database-event-trigger.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { RouteTriggerModule } from 'src/engine/metadata-modules/route-trigger/route-trigger.module';
import { ServerlessFunctionLayerModule } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.module';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, AgentEntity, WorkspaceEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ObjectMetadataModule,
    FieldMetadataModule,
    DataSourceModule,
    ApplicationVariableEntityModule,
    ServerlessFunctionLayerModule,
    ServerlessFunctionModule,
    DatabaseEventTriggerModule,
    CronTriggerModule,
    RouteTriggerModule,
    WorkspaceMigrationV2Module,
  ],
  providers: [ApplicationResolver, ApplicationService, ApplicationSyncService],
})
export class ApplicationModule {}
