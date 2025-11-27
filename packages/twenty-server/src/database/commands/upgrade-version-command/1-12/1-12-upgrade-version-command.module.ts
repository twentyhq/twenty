import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddCalendarEventsImportScheduledSyncStageCommand } from 'src/database/commands/upgrade-version-command/1-12/1-12-add-calendar-events-import-scheduled-sync-stage.command';
import { AddMessagesImportScheduledSyncStageCommand } from 'src/database/commands/upgrade-version-command/1-12/1-12-add-messages-import-scheduled-sync-stage.command';
import { CreateWorkspaceCustomApplicationCommand } from 'src/database/commands/upgrade-version-command/1-12/1-12-create-workspace-custom-application.command';
import { SetStandardApplicationNotUninstallableCommand } from 'src/database/commands/upgrade-version-command/1-12/1-12-set-standard-application-not-uninstallable.command';
import { WorkspaceCustomApplicationIdNonNullableCommand } from 'src/database/commands/upgrade-version-command/1-12/1-12-workspace-custom-application-id-non-nullable-migration.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ObjectMetadataEntity,
      FieldMetadataEntity,
    ]),
    DataSourceModule,
    WorkspaceSchemaManagerModule,
    ApplicationModule,
    FieldMetadataModule,
  ],
  providers: [
    AddCalendarEventsImportScheduledSyncStageCommand,
    AddMessagesImportScheduledSyncStageCommand,
    CreateWorkspaceCustomApplicationCommand,
    SetStandardApplicationNotUninstallableCommand,
    WorkspaceCustomApplicationIdNonNullableCommand,
  ],
  exports: [
    AddCalendarEventsImportScheduledSyncStageCommand,
    AddMessagesImportScheduledSyncStageCommand,
    CreateWorkspaceCustomApplicationCommand,
    SetStandardApplicationNotUninstallableCommand,
    WorkspaceCustomApplicationIdNonNullableCommand,
  ],
})
export class V1_12_UpgradeVersionCommandModule {}
