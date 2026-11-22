import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { DropNotStartedWorkflowRunStatusCommand } from 'src/database/commands/upgrade-version-command/2-62/2-62-workspace-command-1795369199914-drop-not-started-workflow-run-status.command';
import { AddChannelAssociationAccountOwnerAndHandleCommand } from 'src/database/commands/upgrade-version-command/2-62/2-62-workspace-command-1795379764844-add-channel-association-account-owner-and-handle.command';
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
  providers: [
    DropNotStartedWorkflowRunStatusCommand,
    AddChannelAssociationAccountOwnerAndHandleCommand,
  ],
})
export class V2_62_UpgradeVersionCommandModule {}
