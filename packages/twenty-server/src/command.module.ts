import { Module } from '@nestjs/common';

import { DatabaseCommandModule } from 'src/database/commands/database-command.module';
import { FetchWorkspaceMessagesCommandsModule } from 'src/workspace/messaging/commands/fetch-workspace-messages-commands.module';
import { WorkspaceHealthCommandModule } from 'src/workspace/workspace-health/commands/workspace-health-command.module';
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
  ],
})
export class CommandModule {}
