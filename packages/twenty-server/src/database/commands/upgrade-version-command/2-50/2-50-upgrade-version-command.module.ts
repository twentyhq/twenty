import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillFilesFieldRecordFormWidgetsCommand } from 'src/database/commands/upgrade-version-command/2-50/2-50-workspace-command-1792421482633-backfill-files-field-record-form-widgets.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [BackfillFilesFieldRecordFormWidgetsCommand],
})
export class V2_50_UpgradeVersionCommandModule {}
