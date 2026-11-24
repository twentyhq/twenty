import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddMessageChannelMessageAssociationIsReadFieldCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795529228426-add-message-channel-message-association-is-read-field.command';
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
  providers: [AddMessageChannelMessageAssociationIsReadFieldCommand],
})
export class V2_64_UpgradeVersionCommandModule {}
