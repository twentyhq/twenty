import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddDirectMessagePairIdentityCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-workspace-command-1793639083811-add-direct-message-pair-identity.command';
import { EnableDirectMessagePairIdentityCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-workspace-command-1793639083813-enable-direct-message-pair-identity.command';
import { MakeAgentTurnThreadOptionalCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-workspace-command-1793697418663-make-agent-turn-thread-optional.command';
import { InlineWorkflowStepAgentsCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-workspace-command-1793697418665-inline-workflow-step-agents.command';
import { RenameEmailsTabToMessagesCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-workspace-command-1793707166734-rename-emails-tab-to-messages.command';
import { RepairApplicationDependencyChecksumsCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-workspace-command-1793720039867-repair-application-dependency-checksums.command';
import { ApplicationPackageModule } from 'src/engine/core-modules/application/application-package/application-package.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    ApplicationPackageModule,
    FeatureFlagModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    AddDirectMessagePairIdentityCommand,
    EnableDirectMessagePairIdentityCommand,
    MakeAgentTurnThreadOptionalCommand,
    InlineWorkflowStepAgentsCommand,
    RenameEmailsTabToMessagesCommand,
    RepairApplicationDependencyChecksumsCommand,
  ],
})
export class V2_56_UpgradeVersionCommandModule {}
