import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CronRegisterAllCommand } from 'src/database/commands/cron-register-all.command';
import { ConfirmationQuestion } from 'src/database/commands/questions/confirmation.question';
import { UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/upgrade-version-command.module';
import { MigrateViewsToCoreCommand } from 'src/database/commands/views-migration/migrate-views-to-core.command';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
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

    TypeOrmModule.forFeature([Workspace], 'core'),

    // Cron command dependencies
    MessagingImportManagerModule,
    CalendarEventImportManagerModule,
    AutomatedTriggerModule,
    FileModule,

    // Data seeding dependencies
    TypeORMModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    DevSeederModule,
    WorkspaceManagerModule,
    DataSourceModule,
    WorkspaceCacheStorageModule,
    ApiKeyModule,
    FeatureFlagModule,
  ],
  providers: [
    DataSeedWorkspaceCommand,
    MigrateViewsToCoreCommand,
    ConfirmationQuestion,
    CronRegisterAllCommand,
  ],
})
export class DatabaseCommandModule {}
