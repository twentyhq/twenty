import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationInstallResolver } from 'src/engine/core-modules/application/application-install/application-install.resolver';
import { AppPackageFetcherService } from 'src/engine/core-modules/application/application-install/app-package-fetcher.service';
import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationManifestMigrationService } from 'src/engine/core-modules/application/application-install/application-manifest-migration.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-install/application-sync.service';
import { AppUpgradeService } from 'src/engine/core-modules/application/application-install/app-upgrade.service';
import { ApplicationVariableEntityModule } from 'src/engine/core-modules/application/application-variable/application-variable.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { ObjectPermissionModule } from 'src/engine/metadata-modules/object-permission/object-permission.module';
import { PermissionFlagModule } from 'src/engine/metadata-modules/permission-flag/permission-flag.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { CodeStepBuildModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/code-step-build.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FileEntity,
      ApplicationRegistrationEntity,
      ApplicationEntity,
    ]),
    ApplicationModule,
    CacheLockModule,
    FeatureFlagModule,
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
    TwentyConfigModule,
  ],
  providers: [
    ApplicationInstallResolver,
    ApplicationManifestMigrationService,
    ApplicationSyncService,
    AppPackageFetcherService,
    ApplicationInstallService,
    AppUpgradeService,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
  exports: [
    ApplicationSyncService,
    AppPackageFetcherService,
    ApplicationInstallService,
    AppUpgradeService,
  ],
})
export class ApplicationInstallModule {}
