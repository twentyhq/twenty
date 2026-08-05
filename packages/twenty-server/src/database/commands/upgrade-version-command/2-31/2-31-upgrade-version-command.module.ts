import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddCalendarEventCallRecordingTabCommand } from 'src/database/commands/upgrade-version-command/2-31/2-31-workspace-command-1786437483000-add-calendar-event-call-recording-tab.command';
import { ReconcileStandardRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-31/2-31-workspace-command-1786437481000-reconcile-standard-record-page.command';
import { ReconcileWorkspaceCustomRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-31/2-31-workspace-command-1786437481500-reconcile-workspace-custom-record-page.command';
import { BackfillRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-31/2-31-workspace-command-1786437482000-backfill-record-page.command';
import { TrimMessageCampaignRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-31/2-31-workspace-command-1786456707000-trim-message-campaign-record-page.command';
import { ReownObjectNavigationCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-31/2-31-workspace-command-1786500000000-reown-object-navigation-command-menu-items.command';
import { FlagStandardActionCommandMenuItemsSystemSideEffectCommand } from 'src/database/commands/upgrade-version-command/2-31/2-31-workspace-command-1786500001000-flag-standard-action-command-menu-items-system-side-effect.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewEntity, CommandMenuItemEntity]),
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    AddCalendarEventCallRecordingTabCommand,
    ReconcileStandardRecordPageCommand,
    ReconcileWorkspaceCustomRecordPageCommand,
    BackfillRecordPageCommand,
    TrimMessageCampaignRecordPageCommand,
    ReownObjectNavigationCommandMenuItemsCommand,
    FlagStandardActionCommandMenuItemsSystemSideEffectCommand,
  ],
})
export class V2_31_UpgradeVersionCommandModule {}
