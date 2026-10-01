import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ShareEmailAndCalendarThroughRecordSharesCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790840223721-share-email-and-calendar-through-record-shares.command';
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
  providers: [ShareEmailAndCalendarThroughRecordSharesCommand],
})
export class V2_45_UpgradeVersionCommandModule {}
