import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { MigrateConditionalExpressionsToConditionalDisplayCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-workspace-command-1793642440811-migrate-conditional-expressions-to-conditional-display.command';
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
  providers: [MigrateConditionalExpressionsToConditionalDisplayCommand],
})
export class V2_56_UpgradeVersionCommandModule {}
