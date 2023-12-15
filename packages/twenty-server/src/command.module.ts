import { Module } from '@nestjs/common';

import { DatabaseCommandModule } from 'src/database/commands/database-command.module';
import { FetchWorkspaceMessagesCommandsModule } from 'src/workspace/messaging/commands/fetch-workspace-messages-commands.module';

import { AppModule } from './app.module';

import { WorkspaceSyncMetadataCommandsModule } from './workspace/workspace-sync-metadata/commands/workspace-sync-metadata-commands.module';
import { WorkspaceMigrationRunnerCommandsModule } from './workspace/workspace-migration-runner/commands/workspace-migration-runner-commands.module';

@Module({
  imports: [
    AppModule,
    WorkspaceMigrationRunnerCommandsModule,
    WorkspaceSyncMetadataCommandsModule,
    DatabaseCommandModule,
    FetchWorkspaceMessagesCommandsModule,
  ],
})
export class CommandModule {}
