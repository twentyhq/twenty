import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddPersonEmailTrackingConsentCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789571369003-add-person-email-tracking-consent.command';
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
  providers: [AddPersonEmailTrackingConsentCommand],
})
export class V2_42_UpgradeVersionCommandModule {}
