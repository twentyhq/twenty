import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillPageLayoutsAndFieldsWidgetViewFieldsCommand } from 'src/database/commands/upgrade-version-command/1-22/1-22-workspace-command-1780000001000-backfill-page-layouts-and-fields-widget-view-fields.command';
import { BackfillStandardSkillsCommand } from 'src/database/commands/upgrade-version-command/1-22/1-22-workspace-command-1780000002000-backfill-standard-skills.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    FeatureFlagModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    BackfillPageLayoutsAndFieldsWidgetViewFieldsCommand,
    BackfillStandardSkillsCommand,
  ],
})
export class V1_22_UpgradeVersionCommandModule {}
