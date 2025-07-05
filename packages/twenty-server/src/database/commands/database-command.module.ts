import { Module } from '@nestjs/common';

import { CronRegisterAllCommand } from 'src/database/commands/cron-register-all.command';
import { ConfirmationQuestion } from 'src/database/commands/questions/confirmation.question';
import { UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/upgrade-version-command.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { DevSeederModule } from 'src/engine/workspace-manager/dev-seeder/dev-seeder.module';
import { WorkspaceManagerModule } from 'src/engine/workspace-manager/workspace-manager.module';
import { CalendarEventImportManagerModule } from 'src/modules/calendar/calendar-event-import-manager/calendar-event-import-manager.module';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';
import { AutomatedTriggerModule } from 'src/modules/workflow/workflow-trigger/automated-trigger/automated-trigger.module';

import { DataSeedWorkspaceCommand } from './data-seed-dev-workspace.command';

@Module({
  imports: [
    UpgradeVersionCommandModule,

    // Cron command dependencies
    MessagingImportManagerModule,
    CalendarEventImportManagerModule,
    AutomatedTriggerModule,

    // Data seeding dependencies
    TypeORMModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    DevSeederModule,
    WorkspaceManagerModule,
    DataSourceModule,
    WorkspaceCacheStorageModule,
    ApiKeyModule,
  ],
  providers: [
    DataSeedWorkspaceCommand,
    ConfirmationQuestion,
    CronRegisterAllCommand,
  ],
})
export class DatabaseCommandModule {}
