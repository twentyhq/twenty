import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillMessageCalendarTargetsCommand } from 'src/database/commands/upgrade-version-command/2-37/2-37-workspace-command-1787832413051-backfill-message-calendar-targets.command';
import { SyncMessageCalendarTargetMetadataCommand } from 'src/database/commands/upgrade-version-command/2-37/2-37-workspace-command-1787832412051-sync-message-calendar-target-metadata.command';
import { ReownObjectNavigationCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-37/2-37-workspace-command-1787835560000-reown-object-navigation-command-menu-items.command';
import { FlagStandardActionCommandMenuItemsSystemSideEffectCommand } from 'src/database/commands/upgrade-version-command/2-37/2-37-workspace-command-1787835561000-flag-standard-action-command-menu-items-system-side-effect.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    TypeOrmModule.forFeature([CommandMenuItemEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    SyncMessageCalendarTargetMetadataCommand,
    BackfillMessageCalendarTargetsCommand,
    ReownObjectNavigationCommandMenuItemsCommand,
    FlagStandardActionCommandMenuItemsSystemSideEffectCommand,
  ],
})
export class V2_37_UpgradeVersionCommandModule {}
