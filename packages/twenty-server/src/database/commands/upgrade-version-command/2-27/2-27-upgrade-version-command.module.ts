import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddWorkspaceMemberOpenRecordInCommand } from 'src/database/commands/upgrade-version-command/2-27/2-27-workspace-command-1785505000000-add-workspace-member-open-record-in.command';
import { SeedObjectOpenRecordInCommand } from 'src/database/commands/upgrade-version-command/2-27/2-27-workspace-command-1785505100000-seed-object-open-record-in.command';
import { RecreateMissingStandardCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-27/2-27-workspace-command-1785505200000-recreate-missing-standard-command-menu-items.command';
import { BackfillMissingStandardSkillsCommand } from 'src/database/commands/upgrade-version-command/2-27/2-27-workspace-command-1785499350000-backfill-standard-skills.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceIteratorModule,
  ],
  providers: [
    AddWorkspaceMemberOpenRecordInCommand,
    SeedObjectOpenRecordInCommand,
    RecreateMissingStandardCommandMenuItemsCommand,
    BackfillMissingStandardSkillsCommand,
  ],
})
export class V2_27_UpgradeVersionCommandModule {}
