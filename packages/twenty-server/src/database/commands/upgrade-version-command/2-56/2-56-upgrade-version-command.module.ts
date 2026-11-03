import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { MakeAgentTurnThreadOptionalCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-workspace-command-1793638558015-make-agent-turn-thread-optional.command';
import { InlineWorkflowStepAgentsCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-workspace-command-1793638670435-inline-workflow-step-agents.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    MakeAgentTurnThreadOptionalCommand,
    InlineWorkflowStepAgentsCommand,
  ],
})
export class V2_56_UpgradeVersionCommandModule {}
