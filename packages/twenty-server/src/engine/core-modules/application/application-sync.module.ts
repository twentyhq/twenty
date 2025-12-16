import { Module } from '@nestjs/common';

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
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RouteTriggerModule } from 'src/engine/metadata-modules/route-trigger/route-trigger.module';
import { ServerlessFunctionLayerModule } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.module';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/workspace-migration-builder-graphql-api-exception.interceptor';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';
import { ObjectPermissionModule } from 'src/engine/metadata-modules/object-permission/object-permission.module';
import { PermissionFlagModule } from 'src/engine/metadata-modules/permission-flag/permission-flag.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';

@Module({
  imports: [
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
    WorkspaceMigrationV2Module,
    PermissionsModule,
    RoleModule,
    ObjectPermissionModule,
    PermissionFlagModule,
    WorkflowCommonModule,
  ],
  providers: [
    ApplicationResolver,
    ApplicationSyncService,
    WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor,
  ],
  exports: [ApplicationSyncService],
})
export class ApplicationSyncModule {}
