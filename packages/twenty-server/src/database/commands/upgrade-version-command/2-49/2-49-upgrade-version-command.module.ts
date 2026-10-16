import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AllowAssistantMessageReactionsCommand } from 'src/database/commands/upgrade-version-command/2-49/2-49-workspace-command-1792149972537-allow-assistant-message-reactions.command';
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
  providers: [AllowAssistantMessageReactionsCommand],
})
export class V2_49_UpgradeVersionCommandModule {}
