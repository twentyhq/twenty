import { Module } from '@nestjs/common';

import { DatabaseCommandModule } from 'src/database/commands/database-command.module';
import { FetchWorkspaceMessagesCommandsModule } from 'src/workspace/messaging/commands/fetch-workspace-messages-commands.module';
import { StartCleanInactiveWorkspacesCronCommand } from 'src/workspace/cron/commands/start-clean-inactive-workspaces-cron.command';

import { AppModule } from './app.module';

import { WorkspaceSyncMetadataCommandsModule } from './workspace/workspace-sync-metadata/commands/workspace-sync-metadata-commands.module';

@Module({
  imports: [
    AppModule,
    WorkspaceSyncMetadataCommandsModule,
    DatabaseCommandModule,
    FetchWorkspaceMessagesCommandsModule,
    StartCleanInactiveWorkspacesCronCommand,
  ],
})
export class CommandModule {}
