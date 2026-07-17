import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { MigrateWorkflowFilterIsNotNullOperandCommand } from 'src/database/commands/upgrade-version-command/2-23/2-23-workspace-command-1784400000000-migrate-workflow-filter-is-not-null-operand.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceIteratorModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
  ],
  providers: [MigrateWorkflowFilterIsNotNullOperandCommand],
})
export class V2_23_UpgradeVersionCommandModule {}
