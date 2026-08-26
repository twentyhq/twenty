import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddBlocklistScopeFieldCommand } from 'src/database/commands/upgrade-version-command/2-36/2-36-workspace-command-1787755314016-add-blocklist-scope-field.command';
import { RewriteIsNotNullWorkflowFilterOperandsCommand } from 'src/database/commands/upgrade-version-command/2-36/2-36-workspace-command-1787700000000-rewrite-is-not-null-workflow-filter-operands.command';
import { AddCallRecordingSummaryAndTranscriptTabsCommand } from 'src/database/commands/upgrade-version-command/2-36/2-36-workspace-command-1787746350922-add-call-recording-summary-and-transcript-tabs.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    AddBlocklistScopeFieldCommand,
    RewriteIsNotNullWorkflowFilterOperandsCommand,
    AddCallRecordingSummaryAndTranscriptTabsCommand,
  ],
})
export class V2_36_UpgradeVersionCommandModule {}
