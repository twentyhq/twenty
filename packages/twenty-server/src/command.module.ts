import { Module } from '@nestjs/common';

import { DatabaseCommandModule } from 'src/database/commands/database-command.module';
import { FetchWorkspaceMessagesCommandsModule } from 'src/workspace/messaging/commands/fetch-workspace-messages-commands.module';
import { StartCleanInactiveWorkspacesCronCommand } from 'src/workspace/cron/clean-inactive-workspaces/commands/start-clean-inactive-workspaces.cron.command';
import { StopCleanInactiveWorkspacesCronCommand } from 'src/workspace/cron/clean-inactive-workspaces/commands/stop-clean-inactive-workspaces.cron.command';
import { CleanInactiveWorkspacesCommand } from 'src/workspace/cron/clean-inactive-workspaces/commands/clean-inactive-workspaces.command';
import { WorkspaceHealthCommandModule } from 'src/workspace/workspace-health/commands/workspace-health-command.module';

import { AppModule } from './app.module';

import { WorkspaceSyncMetadataCommandsModule } from './workspace/workspace-sync-metadata/commands/workspace-sync-metadata-commands.module';

@Module({
  imports: [
    AppModule,
    WorkspaceSyncMetadataCommandsModule,
    DatabaseCommandModule,
    FetchWorkspaceMessagesCommandsModule,
    StartCleanInactiveWorkspacesCronCommand,
    StopCleanInactiveWorkspacesCronCommand,
    CleanInactiveWorkspacesCommand,
    WorkspaceHealthCommandModule,
  ],
})
export class CommandModule {}
