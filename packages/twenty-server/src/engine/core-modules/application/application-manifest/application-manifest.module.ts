import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationManifestMigrationService } from 'src/engine/core-modules/application/application-manifest/services/application-manifest-migration.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/services/application-sync.service';
import { ApplicationVariableEntityModule } from 'src/engine/core-modules/application/application-variable/application-variable.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { ObjectPermissionModule } from 'src/engine/metadata-modules/object-permission/object-permission.module';
import { PermissionFlagModule } from 'src/engine/metadata-modules/permission-flag/permission-flag.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    ApplicationVariableEntityModule,
    FileStorageModule,
    ObjectPermissionModule,
    PermissionFlagModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    ApplicationManifestMigrationService,
    ApplicationSyncService,
  ],
  exports: [ApplicationSyncService],
})
export class ApplicationManifestModule {}
