import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MigratePersonAvatarFilesCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-migrate-person-avatar-files.command';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      FeatureFlagEntity,
      PersonWorkspaceEntity,
      FileEntity,
    ]),
    DataSourceModule,
    FeatureFlagModule,
    FileStorageModule.forRoot(),
    WorkspaceCacheModule,
    FieldMetadataModule,
  ],
  providers: [MigratePersonAvatarFilesCommand],
  exports: [MigratePersonAvatarFilesCommand],
})
export class V1_18_UpgradeVersionCommandModule {}
