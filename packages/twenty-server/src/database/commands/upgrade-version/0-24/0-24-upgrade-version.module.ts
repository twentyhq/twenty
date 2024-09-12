import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SetCustomObjectIsSoftDeletableCommand } from 'src/database/commands/upgrade-version/0-24/0-24-set-custom-object-is-soft-deletable.command';
import { SetMessageDirectionCommand } from 'src/database/commands/upgrade-version/0-24/0-24-set-message-direction.command';
import { UpgradeTo0_24Command } from 'src/database/commands/upgrade-version/0-24/0-24-upgrade-version.command';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceStatusModule } from 'src/engine/workspace-manager/workspace-status/workspace-manager.module';
import { WorkspaceSyncMetadataCommandsModule } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/workspace-sync-metadata-commands.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, KeyValuePair], 'core'),
    WorkspaceSyncMetadataCommandsModule,
    FileStorageModule,
    OnboardingModule,
    TypeORMModule,
    DataSourceModule,
    WorkspaceMetadataVersionModule,
    FieldMetadataModule,
    WorkspaceStatusModule,
    TypeOrmModule.forFeature(
      [FieldMetadataEntity, ObjectMetadataEntity],
      'metadata',
    ),
    TypeORMModule,
  ],
  providers: [
    UpgradeTo0_24Command,
    SetMessageDirectionCommand,
    SetCustomObjectIsSoftDeletableCommand,
  ],
})
export class UpgradeTo0_24CommandModule {}
