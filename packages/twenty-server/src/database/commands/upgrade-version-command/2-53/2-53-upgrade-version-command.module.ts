import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddChatAssistantParticipationCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793111719062-add-chat-assistant-participation.command';
import { RenameAppPermissionFlagKeysCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793184116626-rename-app-permission-flag-keys.command';
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
  providers: [
    AddChatAssistantParticipationCommand,
    RenameAppPermissionFlagKeysCommand,
  ],
})
export class V2_53_UpgradeVersionCommandModule {}
