import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { CopyPageLayoutWidgetRulesToConditionalAvailabilityCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795435759328-copy-page-layout-widget-rules-to-conditional-availability.command';
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
  providers: [CopyPageLayoutWidgetRulesToConditionalAvailabilityCommand],
})
export class V2_63_UpgradeVersionCommandModule {}
