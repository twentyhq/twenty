import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { DropWorkspaceWorkflowVersionObjectCommand } from 'src/database/commands/upgrade-version-command/2-60/2-60-workspace-command-1794824591819-drop-workspace-workflow-version-object.command';
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
  providers: [DropWorkspaceWorkflowVersionObjectCommand],
})
export class V2_60_UpgradeVersionCommandModule {}
