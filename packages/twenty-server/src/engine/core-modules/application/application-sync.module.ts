import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationDevelopmentResolver } from 'src/engine/core-modules/application/resolvers/application-development.resolver';
import { ApplicationResolver } from 'src/engine/core-modules/application/resolvers/application.resolver';
import { MarketplaceResolver } from 'src/engine/core-modules/application/resolvers/marketplace.resolver';
import { ApplicationManifestMigrationService } from 'src/engine/core-modules/application/services/application-manifest-migration.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/services/application-sync.service';
import { ApplicationVariableEntityModule } from 'src/engine/core-modules/applicationVariable/application-variable.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { ObjectPermissionModule } from 'src/engine/metadata-modules/object-permission/object-permission.module';
import { PermissionFlagModule } from 'src/engine/metadata-modules/permission-flag/permission-flag.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { CodeStepBuildModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/code-step-build.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    ApplicationModule,
    ApplicationVariableEntityModule,
    TokenModule,
    WorkspaceMigrationModule,
    PermissionsModule,
    ObjectPermissionModule,
    PermissionFlagModule,
    WorkflowCommonModule,
    CodeStepBuildModule,
    FileStorageModule,
    WorkspaceCacheModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    ApplicationResolver,
    ApplicationDevelopmentResolver,
    MarketplaceResolver,
    ApplicationManifestMigrationService,
    ApplicationSyncService,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
  exports: [ApplicationSyncService],
})
export class ApplicationSyncModule {}
