import { BackfillWorkspaceWorkflowVersionIdCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789652804001-backfill-workspace-workflow-version-id.command';
import { BackfillWorkflowExecutionCoreIdsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789719131001-backfill-workflow-execution-core-ids.command';
import { MakeWorkflowRunProjectionRelationsNullableCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789719131002-make-workflow-run-projection-relations-nullable.command';
import { PurgeSoftDeletedRowLevelPermissionPredicatesCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789744560000-purge-soft-deleted-row-level-permission-predicates.command';
import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { UnpinCreationCommandsOnRecordSelectionCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789634112046-unpin-creation-commands-on-record-selection.command';
import { BackfillMissingSystemRelationIndexesCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789663454000-backfill-missing-system-relation-indexes.command';
import { RelinkWorkflowVersionsToCoreWorkflowsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789645879295-relink-workflow-versions-to-core-workflows.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceSchemaManagerModule,
    WorkspaceSchemaMigrationRunnerActionHandlersModule,
  ],
  providers: [
    UnpinCreationCommandsOnRecordSelectionCommand,
    RelinkWorkflowVersionsToCoreWorkflowsCommand,
    BackfillWorkspaceWorkflowVersionIdCommand,
    BackfillWorkflowExecutionCoreIdsCommand,
    MakeWorkflowRunProjectionRelationsNullableCommand,
    BackfillMissingSystemRelationIndexesCommand,
    PurgeSoftDeletedRowLevelPermissionPredicatesCommand,
  ],
  exports: [RelinkWorkflowVersionsToCoreWorkflowsCommand],
})
export class V2_42_UpgradeVersionCommandModule {}
