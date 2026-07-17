import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddWorkflowCoreSoftRefFieldCommand } from 'src/database/commands/upgrade-version-command/2-23/2-23-workspace-command-1784286706000-add-workflow-core-soft-ref-field.command';
import { BackfillWorkflowCoreLinksCommand } from 'src/database/commands/upgrade-version-command/2-23/2-23-workspace-command-1784286707000-backfill-workflow-core-links.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceIteratorModule,
  ],
  providers: [
    AddWorkflowCoreSoftRefFieldCommand,
    BackfillWorkflowCoreLinksCommand,
  ],
})
export class V2_23_UpgradeVersionCommandModule {}
