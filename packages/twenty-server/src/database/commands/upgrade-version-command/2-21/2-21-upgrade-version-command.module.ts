import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillCompanyPersonImageIdentifierFieldMetadataIdCommand } from 'src/database/commands/upgrade-version-command/2-21/2-21-workspace-command-1783725468107-backfill-company-person-image-identifier-field-metadata-id.command';
import { MigratePersonAvatarUrlToAvatarFileCommand } from 'src/database/commands/upgrade-version-command/2-21/2-21-workspace-command-1783725960291-migrate-person-avatar-url-to-avatar-file.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FilesFieldModule } from 'src/engine/core-modules/file/files-field/files-field.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { GlobalWorkspaceDataSourceModule } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    FilesFieldModule,
    GlobalWorkspaceDataSourceModule,
    SecureHttpClientModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    BackfillCompanyPersonImageIdentifierFieldMetadataIdCommand,
    MigratePersonAvatarUrlToAvatarFileCommand,
  ],
})
export class V2_21_UpgradeVersionCommandModule {}
