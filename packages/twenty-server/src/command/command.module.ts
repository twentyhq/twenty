import { Module } from '@nestjs/common';

import { DatabaseCommandModule } from 'src/database/commands/database-command.module';
import { WorkspaceHealthCommandModule } from 'src/engine/workspace-manager/workspace-health/commands/workspace-health-command.module';
import { WorkspaceCleanerModule } from 'src/engine/workspace-manager/workspace-cleaner/workspace-cleaner.module';
import { CalendarCronCommandsModule } from 'src/modules/calendar/crons/commands/calendar-cron-commands.module';
import { AppModule } from 'src/app.module';
import { WorkspaceMigrationRunnerCommandsModule } from 'src/engine/workspace-manager/workspace-migration-runner/commands/workspace-sync-metadata-commands.module';
import { WorkspaceSyncMetadataCommandsModule } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/workspace-sync-metadata-commands.module';
import { CalendarCommandsModule } from 'src/modules/calendar/commands/calendar-commands.module';

@Module({
  imports: [
    AppModule,
    WorkspaceSyncMetadataCommandsModule,
    DatabaseCommandModule,
    // MessagingCronCommandsModule,
    CalendarCronCommandsModule,
    CalendarCommandsModule,
    WorkspaceCleanerModule,
    WorkspaceHealthCommandModule,
    WorkspaceMigrationRunnerCommandsModule,
  ],
})
export class CommandModule {}
