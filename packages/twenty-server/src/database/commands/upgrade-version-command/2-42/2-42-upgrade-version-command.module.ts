import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { UnpinCreationCommandsOnRecordSelectionCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789634112046-unpin-creation-commands-on-record-selection.command';
import { AddPersonEmailTrackingConsentCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789639200003-add-person-email-tracking-consent.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
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
    WorkspaceSchemaMigrationRunnerActionHandlersModule,
  ],
  providers: [
    UnpinCreationCommandsOnRecordSelectionCommand,
    AddPersonEmailTrackingConsentCommand,
  ],
})
export class V2_42_UpgradeVersionCommandModule {}
