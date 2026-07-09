import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationManifestMigrationService } from 'src/engine/core-modules/application/application-manifest/application-manifest-migration.service';
import { ComputeApplicationManifestAllUniversalFlatEntityMapsService } from 'src/engine/core-modules/application/application-manifest/services/compute-application-manifest-all-universal-flat-entity-maps.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationTranslationModule } from 'src/engine/core-modules/application/application-translation/application-translation.module';
import { ApplicationVariableEntityModule } from 'src/engine/core-modules/application/application-variable/application-variable.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    ApplicationModule,
    ApplicationTranslationModule,
    ApplicationVariableEntityModule,
    FeatureFlagModule,
    FileStorageModule,
    PermissionsModule,
    SecretEncryptionModule,
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    ApplicationManifestMigrationService,
    ApplicationSyncService,
    ComputeApplicationManifestAllUniversalFlatEntityMapsService,
  ],
  exports: [ApplicationManifestMigrationService, ApplicationSyncService],
})
export class ApplicationManifestModule {}
