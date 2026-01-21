import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationSyncService } from 'src/engine/core-modules/application/application-sync.service';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationResolver } from 'src/engine/core-modules/application/application.resolver';
import { ApplicationVariableEntityModule } from 'src/engine/core-modules/applicationVariable/application-variable.module';
import { CronTriggerModule } from 'src/engine/metadata-modules/cron-trigger/cron-trigger.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { DatabaseEventTriggerModule } from 'src/engine/metadata-modules/database-event-trigger/database-event-trigger.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { ObjectPermissionModule } from 'src/engine/metadata-modules/object-permission/object-permission.module';
import { PermissionFlagModule } from 'src/engine/metadata-modules/permission-flag/permission-flag.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { RouteTriggerModule } from 'src/engine/metadata-modules/route-trigger/route-trigger.module';
import { ServerlessFunctionLayerModule } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.module';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-builder-graphql-api-exception.interceptor';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    ApplicationModule,
    ApplicationVariableEntityModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ObjectMetadataModule,
    FieldMetadataModule,
    DataSourceModule,
    ServerlessFunctionLayerModule,
    ServerlessFunctionModule,
    DatabaseEventTriggerModule,
    CronTriggerModule,
    RouteTriggerModule,
    WorkspaceMigrationModule,
    PermissionsModule,
    RoleModule,
    ObjectPermissionModule,
    PermissionFlagModule,
    WorkflowCommonModule,
    FileStorageModule,
  ],
  providers: [
    ApplicationResolver,
    ApplicationSyncService,
    WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor,
  ],
  exports: [ApplicationSyncService],
})
export class ApplicationSyncModule {}
