import { Module } from '@nestjs/common';

import { AppModule } from 'src/app.module';
import { DatabaseCommandModule } from 'src/database/commands/database-command.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WorkspaceCleanerModule } from 'src/engine/workspace-manager/workspace-cleaner/workspace-cleaner.module';
import { WorkspaceMigrationRunnerCommandsModule } from 'src/engine/workspace-manager/workspace-migration-runner/commands/workspace-migration-runner-commands.module';
import { WorkspaceSyncMetadataCommandsModule } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/workspace-sync-metadata-commands.module';
import { MessagingMessageCleanerModule } from 'src/modules/messaging/message-cleaner/messaging-message-cleaner.module';

@Module({
  imports: [
    AppModule,
    WorkspaceSyncMetadataCommandsModule,
    DatabaseCommandModule,
    MessagingMessageCleanerModule,
    WorkspaceMigrationRunnerCommandsModule,
    ObjectMetadataModule,
    FieldMetadataModule,
    WorkspaceCleanerModule,
  ],
})
export class CommandModule {}
