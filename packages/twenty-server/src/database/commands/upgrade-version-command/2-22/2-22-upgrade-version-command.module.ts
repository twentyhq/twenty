import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillCompanyPersonImageIdentifierFieldMetadataIdCommand } from 'src/database/commands/upgrade-version-command/2-22/2-22-workspace-command-1783959648000-backfill-company-person-image-identifier-field-metadata-id.command';
import { MigratePersonAvatarUrlToAvatarFileCommand } from 'src/database/commands/upgrade-version-command/2-22/2-22-workspace-command-1783960128000-migrate-person-avatar-url-to-avatar-file.command';
import { AddWorkflowVersionCoreSoftRefFieldCommand } from 'src/database/commands/upgrade-version-command/2-22/2-22-workspace-command-1784193206000-add-workflow-version-core-soft-ref-field.command';
import { BackfillWorkflowVersionCoreLinksCommand } from 'src/database/commands/upgrade-version-command/2-22/2-22-workspace-command-1784193207000-backfill-workflow-version-core-links.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FilesFieldModule } from 'src/engine/core-modules/file/files-field/files-field.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    FilesFieldModule,
    SecureHttpClientModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceIteratorModule,
  ],
  providers: [
    BackfillCompanyPersonImageIdentifierFieldMetadataIdCommand,
    MigratePersonAvatarUrlToAvatarFileCommand,
    AddWorkflowVersionCoreSoftRefFieldCommand,
    BackfillWorkflowVersionCoreLinksCommand,
  ],
})
export class V2_22_UpgradeVersionCommandModule {}
