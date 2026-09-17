import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { MakeAskAiAvailableInCommandMenuCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789632589264-make-ask-ai-available-in-command-menu.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [MakeAskAiAvailableInCommandMenuCommand],
})
export class V2_42_UpgradeVersionCommandModule {}
