import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { FilesFieldDeletionJob } from 'src/engine/core-modules/file/files-field/jobs/files-field-deletion.job';
import { FilesFieldDeletionListener } from 'src/engine/core-modules/file/files-field/listeners/files-field-deletion.listener';
import { FilesFieldResolver } from 'src/engine/core-modules/file/files-field/resolvers/files-field.resolver';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ApplicationEntity,
      FieldMetadataEntity,
      FileEntity,
    ]),
    PermissionsModule,
    FileUrlModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    FilesFieldService,
    FilesFieldResolver,
    FilesFieldDeletionListener,
    FilesFieldDeletionJob,
    provideWorkspaceScopedRepository(FileEntity),
    provideWorkspaceScopedRepository(FieldMetadataEntity),
    provideWorkspaceScopedRepository(ApplicationEntity),
  ],
  exports: [FilesFieldService],
})
export class FilesFieldModule {}
