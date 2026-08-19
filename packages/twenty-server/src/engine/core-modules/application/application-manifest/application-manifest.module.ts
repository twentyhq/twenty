import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationManifestApplyService } from 'src/engine/core-modules/application/application-manifest/application-manifest-apply.service';
import { ApplicationManifestMigrationService } from 'src/engine/core-modules/application/application-manifest/application-manifest-migration.service';
import { ApplicationUninstallService } from 'src/engine/core-modules/application/application-manifest/services/application-uninstall.service';
import { ComputeApplicationManifestAllUniversalFlatEntityMapsService } from 'src/engine/core-modules/application/application-manifest/services/compute-application-manifest-all-universal-flat-entity-maps.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { ApplicationTranslationModule } from 'src/engine/core-modules/application/application-translation/application-translation.module';
import { ApplicationVariableEntityModule } from 'src/engine/core-modules/application/application-variable/application-variable.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { SdkClientModule } from 'src/engine/core-modules/sdk-client/sdk-client.module';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, FrontComponentEntity]),
    ApplicationModule,
    ApplicationRegistrationModule,
    ApplicationTranslationModule,
    ApplicationVariableEntityModule,
    FeatureFlagModule,
    FileStorageModule,
    LogicFunctionExecutorModule,
    PermissionsModule,
    SecretEncryptionModule,
    SdkClientModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    ApplicationManifestApplyService,
    ApplicationManifestMigrationService,
    ApplicationSyncService,
    ApplicationUninstallService,
    ComputeApplicationManifestAllUniversalFlatEntityMapsService,
  ],
  exports: [
    ApplicationManifestApplyService,
    ApplicationManifestMigrationService,
    ApplicationSyncService,
    ApplicationUninstallService,
  ],
})
export class ApplicationManifestModule {}
