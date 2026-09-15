import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddInactiveGenericStandardFieldsCommand } from 'src/database/commands/upgrade-version-command/2-10/2-10-workspace-command-1799000050000-add-inactive-generic-standard-fields.command';
import { MoveDemotedStandardFieldsToCustomApplicationCommand } from 'src/database/commands/upgrade-version-command/2-10/2-10-workspace-command-1799000040000-move-demoted-standard-fields-to-custom-application.command';
import { RenameConflictingCustomFieldsCommand } from 'src/database/commands/upgrade-version-command/2-10/2-10-workspace-command-1799000045000-rename-conflicting-custom-fields.command';
import { SyncCallRecordingStandardObjectsCommand } from 'src/database/commands/upgrade-version-command/2-10/2-10-workspace-command-1799000055000-sync-call-recording-standard-objects.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMetadataVersionModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    MoveDemotedStandardFieldsToCustomApplicationCommand,
    RenameConflictingCustomFieldsCommand,
    AddInactiveGenericStandardFieldsCommand,
    SyncCallRecordingStandardObjectsCommand,
  ],
})
export class V2_10_UpgradeVersionCommandModule {}
