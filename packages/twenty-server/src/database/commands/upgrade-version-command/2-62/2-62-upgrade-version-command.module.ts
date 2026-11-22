import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { DropNotStartedWorkflowRunStatusCommand } from 'src/database/commands/upgrade-version-command/2-62/2-62-workspace-command-1795369199914-drop-not-started-workflow-run-status.command';
import { AddOpenCommandMenuCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-62/2-62-workspace-command-1795384110700-add-open-command-menu-command-menu-item.command';
import { AddStandardPinnedCommandsCommand } from 'src/database/commands/upgrade-version-command/2-62/2-62-workspace-command-1795384328297-add-standard-pinned-commands.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [WorkspaceCacheModule, WorkspaceIteratorModule, WorkspaceMigrationModule],
  providers: [
    DropNotStartedWorkflowRunStatusCommand,
    AddOpenCommandMenuCommandMenuItemCommand,
    AddStandardPinnedCommandsCommand,
  ],
})
export class V2_62_UpgradeVersionCommandModule {}
