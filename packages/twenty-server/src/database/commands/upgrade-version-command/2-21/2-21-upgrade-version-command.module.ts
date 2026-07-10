import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillCompanyPersonImageIdentifierFieldMetadataIdCommand } from 'src/database/commands/upgrade-version-command/2-21/2-21-workspace-command-1783725468107-backfill-company-person-image-identifier-field-metadata-id.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [BackfillCompanyPersonImageIdentifierFieldMetadataIdCommand],
})
export class V2_21_UpgradeVersionCommandModule {}
