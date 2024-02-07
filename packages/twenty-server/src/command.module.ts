import { Module } from '@nestjs/common';

import { DatabaseCommandModule } from 'src/database/commands/database-command.module';
import { FetchWorkspaceMessagesCommandsModule } from 'src/workspace/messaging/commands/fetch-workspace-messages-commands.module';
import { WorkspaceHealthCommandModule } from 'src/workspace/workspace-health/commands/workspace-health-command.module';
import { StartFetchAllWorkspacesMessagesCronCommand } from 'src/workspace/cron/fetch-all-workspaces-messages/commands/start-fetch-all-workspaces-messages.cron.command';
import { StopFetchAllWorkspacesMessagesCronCommand } from 'src/workspace/cron/fetch-all-workspaces-messages/commands/stop-fetch-all-workspaces-messages.cron.command';
import { WorkspaceCleanerModule } from 'src/workspace/workspace-cleaner/workspace-cleaner.module';

import { AppModule } from './app.module';

import { WorkspaceSyncMetadataCommandsModule } from './workspace/workspace-sync-metadata/commands/workspace-sync-metadata-commands.module';
import { WorkspaceMigrationRunnerCommandsModule } from './workspace/workspace-migration-runner/commands/workspace-sync-metadata-commands.module';

@Module({
  imports: [
    AppModule,
    WorkspaceSyncMetadataCommandsModule,
    DatabaseCommandModule,
    FetchWorkspaceMessagesCommandsModule,
    WorkspaceCleanerModule,
    WorkspaceHealthCommandModule,
    WorkspaceMigrationRunnerCommandsModule,
    StartFetchAllWorkspacesMessagesCronCommand,
    StopFetchAllWorkspacesMessagesCronCommand,
  ],
})
export class CommandModule {}
