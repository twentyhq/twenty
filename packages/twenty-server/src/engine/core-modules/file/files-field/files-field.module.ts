import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { FilesFieldDeletionJob } from 'src/engine/core-modules/file/files-field/jobs/files-field-deletion.job';
import { FilesFieldDeletionListener } from 'src/engine/core-modules/file/files-field/listeners/files-field-deletion.listener';
import { FilesFieldResolver } from 'src/engine/core-modules/file/files-field/resolvers/files-field.resolver';
import { FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ApplicationEntity,
      FieldMetadataEntity,
    ]),
    PermissionsModule,
    FileStorageModule,
    FileUrlModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    FilesFieldService,
    FilesFieldResolver,
    FilesFieldDeletionListener,
    FilesFieldDeletionJob,
  ],
  exports: [FilesFieldService],
})
export class FilesFieldModule {}
