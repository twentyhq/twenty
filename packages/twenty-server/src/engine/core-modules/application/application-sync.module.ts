import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationResolver } from 'src/engine/core-modules/application/resolvers/application.resolver';
import { MarketplaceResolver } from 'src/engine/core-modules/application/resolvers/marketplace.resolver';
import { ApplicationSyncService } from 'src/engine/core-modules/application/services/application-sync.service';
import { ApplicationVariableEntityModule } from 'src/engine/core-modules/applicationVariable/application-variable.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { LogicFunctionLayerModule } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { ObjectPermissionModule } from 'src/engine/metadata-modules/object-permission/object-permission.module';
import { PermissionFlagModule } from 'src/engine/metadata-modules/permission-flag/permission-flag.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    ApplicationModule,
    ApplicationVariableEntityModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ObjectMetadataModule,
    FieldMetadataModule,
    DataSourceModule,
    LogicFunctionLayerModule,
    LogicFunctionModule,
    WorkspaceMigrationModule,
    PermissionsModule,
    RoleModule,
    ObjectPermissionModule,
    PermissionFlagModule,
    WorkflowCommonModule,
    FileStorageModule,
    WorkspaceCacheModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    ApplicationResolver,
    MarketplaceResolver,
    ApplicationSyncService,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
  exports: [ApplicationSyncService],
})
export class ApplicationSyncModule {}
