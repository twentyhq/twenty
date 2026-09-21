import { Module } from '@nestjs/common';

import { MigrateAgentHistoryToWorkspaceCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789914239896-migrate-agent-history-to-workspace.command';
import { AgentHistoryMigrationModule } from 'src/database/commands/agent-history/agent-history-migration.module';
import { AgentChatStreamStateModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-stream-state.module';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { BackfillWorkspaceWorkflowVersionIdCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789652804001-backfill-workspace-workflow-version-id.command';
import { BackfillWorkflowExecutionCoreIdsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789719131001-backfill-workflow-execution-core-ids.command';
import { MakeWorkflowRunProjectionRelationsNullableCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789719131002-make-workflow-run-projection-relations-nullable.command';
import { PurgeSoftDeletedViewsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789744500000-purge-soft-deleted-views.command';
import { PurgeSoftDeletedRowLevelPermissionPredicatesCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789978629000-purge-soft-deleted-row-level-permission-predicates.command';
import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { UnpinCreationCommandsOnRecordSelectionCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789634112046-unpin-creation-commands-on-record-selection.command';
import { BackfillMissingSystemRelationIndexesCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789663454000-backfill-missing-system-relation-indexes.command';
import { RelinkWorkflowVersionsToCoreWorkflowsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789645879295-relink-workflow-versions-to-core-workflows.command';
import { SyncMessageRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789757500000-sync-message-record-page.command';
import { SetMessageTextDisplayedMaxRowsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789757500001-set-message-text-displayed-max-rows.command';
import { SyncInputAskObjectCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1790001097000-sync-input-ask-object.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';

@Module({
  imports: [
    AgentHistoryMigrationModule,
    AgentChatStreamStateModule,
    AgentHistoryModule,
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceSchemaManagerModule,
    WorkspaceSchemaMigrationRunnerActionHandlersModule,
  ],
  providers: [
    MigrateAgentHistoryToWorkspaceCommand,
    UnpinCreationCommandsOnRecordSelectionCommand,
    RelinkWorkflowVersionsToCoreWorkflowsCommand,
    BackfillWorkspaceWorkflowVersionIdCommand,
    BackfillWorkflowExecutionCoreIdsCommand,
    MakeWorkflowRunProjectionRelationsNullableCommand,
    BackfillMissingSystemRelationIndexesCommand,
    PurgeSoftDeletedViewsCommand,
    SyncMessageRecordPageCommand,
    SetMessageTextDisplayedMaxRowsCommand,
    SyncInputAskObjectCommand,
    PurgeSoftDeletedRowLevelPermissionPredicatesCommand,
  ],
  exports: [RelinkWorkflowVersionsToCoreWorkflowsCommand],
})
export class V2_42_UpgradeVersionCommandModule {}
