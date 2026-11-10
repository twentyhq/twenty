import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { DropCodeStepLogicFunctionsCommand } from 'src/database/commands/upgrade-version-command/2-58/2-58-workspace-command-1794234108117-drop-code-step-logic-functions.command';
import { AddCoreWorkflowMetadataCommand } from 'src/database/commands/upgrade-version-command/2-58/2-58-workspace-command-1794269047171-add-core-workflow-metadata.command';
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
    DropCodeStepLogicFunctionsCommand,
    AddCoreWorkflowMetadataCommand,
  ],
})
export class V2_58_UpgradeVersionCommandModule {}
