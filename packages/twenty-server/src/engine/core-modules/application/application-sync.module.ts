import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application-registration/application-registration.entity';
import { ApplicationRegistrationModule } from 'src/engine/core-modules/application-registration/application-registration.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationDevelopmentResolver } from 'src/engine/core-modules/application/resolvers/application-development.resolver';
import { ApplicationResolver } from 'src/engine/core-modules/application/resolvers/application.resolver';
import { AppPackageResolverService } from 'src/engine/core-modules/application/services/app-package-resolver.service';
import { ApplicationInstallService } from 'src/engine/core-modules/application/services/application-install.service';
import { ApplicationManifestMigrationService } from 'src/engine/core-modules/application/services/application-manifest-migration.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/services/application-sync.service';
import { AppUpgradeService } from 'src/engine/core-modules/application/services/app-upgrade.service';
import { ApplicationVariableEntityModule } from 'src/engine/core-modules/applicationVariable/application-variable.module';
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
    ApplicationRegistrationModule,
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
    TwentyConfigModule,
  ],
  providers: [
    ApplicationResolver,
    ApplicationDevelopmentResolver,
    ApplicationManifestMigrationService,
    ApplicationSyncService,
    AppPackageResolverService,
    ApplicationInstallService,
    AppUpgradeService,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
  exports: [
    ApplicationSyncService,
    AppPackageResolverService,
    ApplicationInstallService,
    AppUpgradeService,
  ],
})
export class ApplicationSyncModule {}
