import { BackfillWorkspaceWorkflowVersionIdCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789652804001-backfill-workspace-workflow-version-id.command';
import { BackfillWorkflowExecutionCoreIdsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789593132221-backfill-workflow-execution-core-ids.command';
import { MakeWorkflowRunProjectionRelationsNullableCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789593132222-make-workflow-run-projection-relations-nullable.command';
import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { UnpinCreationCommandsOnRecordSelectionCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789634112046-unpin-creation-commands-on-record-selection.command';
import { RelinkWorkflowVersionsToCoreWorkflowsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789645879295-relink-workflow-versions-to-core-workflows.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceSchemaMigrationRunnerActionHandlersModule,
  ],
  providers: [
    UnpinCreationCommandsOnRecordSelectionCommand,
    RelinkWorkflowVersionsToCoreWorkflowsCommand,
    BackfillWorkspaceWorkflowVersionIdCommand,
    BackfillWorkflowExecutionCoreIdsCommand,
    MakeWorkflowRunProjectionRelationsNullableCommand,
  ],
  exports: [RelinkWorkflowVersionsToCoreWorkflowsCommand],
})
export class V2_42_UpgradeVersionCommandModule {}
