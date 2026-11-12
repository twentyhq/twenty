import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { DropCodeStepLogicFunctionsCommand } from 'src/database/commands/upgrade-version-command/2-58/2-58-workspace-command-1794234108117-drop-code-step-logic-functions.command';
import { AddCoreWorkflowMetadataCommand } from 'src/database/commands/upgrade-version-command/2-58/2-58-workspace-command-1794269047171-add-core-workflow-metadata.command';
import { DropWorkspaceWorkflowObjectCommand } from 'src/database/commands/upgrade-version-command/2-58/2-58-workspace-command-1794298481339-drop-workspace-workflow-object.command';
import { RecomputeFieldMetadataMapsForRowLevelPermissionPredicatesCommand } from 'src/database/commands/upgrade-version-command/2-58/2-58-workspace-command-1794335924429-recompute-field-metadata-maps-for-row-level-permission-predicates.command';
import { BackfillRowLevelPermissionRulesCommand } from 'src/database/commands/upgrade-version-command/2-58/2-58-workspace-command-1794337540466-backfill-row-level-permission-rules.command';
import { BackfillWorkflowRunCoreWorkflowIdCreatedAtIndexCommand } from 'src/database/commands/upgrade-version-command/2-58/2-58-workspace-command-1794374946191-backfill-workflow-run-core-workflow-id-created-at-index.command';
import { ShowTidyUpWorkflowOnManualLayoutCommand } from 'src/database/commands/upgrade-version-command/2-58/2-58-workspace-command-1794407965151-show-tidy-up-workflow-on-manual-layout.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    DropCodeStepLogicFunctionsCommand,
    AddCoreWorkflowMetadataCommand,
    DropWorkspaceWorkflowObjectCommand,
    RecomputeFieldMetadataMapsForRowLevelPermissionPredicatesCommand,
    BackfillRowLevelPermissionRulesCommand,
    BackfillWorkflowRunCoreWorkflowIdCreatedAtIndexCommand,
    ShowTidyUpWorkflowOnManualLayoutCommand,
  ],
})
export class V2_58_UpgradeVersionCommandModule {}
