import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FilesFieldDeletionJob } from 'src/engine/core-modules/file/files-field/jobs/files-field-deletion.job';
import { FilesFieldDeletionListener } from 'src/engine/core-modules/file/files-field/listeners/files-field-deletion.listener';
import { FilePathGuard } from 'src/engine/core-modules/file/guards/file-path-guard';
import { FileDeletionJob } from 'src/engine/core-modules/file/jobs/file-deletion.job';
import { FileWorkspaceFolderDeletionJob } from 'src/engine/core-modules/file/jobs/file-workspace-folder-deletion.job';
import { FileAttachmentListener } from 'src/engine/core-modules/file/listeners/file-attachment.listener';
import { FileWorkspaceMemberListener } from 'src/engine/core-modules/file/listeners/file-workspace-member.listener';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

import { FileController } from './controllers/file.controller';
import { FileEntity } from './entities/file.entity';
import { FileUploadService } from './file-upload/services/file-upload.service';
import { FilesFieldService } from './files-field/files-field.service';
import { FileResolver } from './resolvers/file.resolver';
import { FileMetadataService } from './services/file-metadata.service';
import { FileService } from './services/file.service';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([FileEntity, WorkspaceEntity, ApplicationEntity]),
    HttpModule,
    PermissionsModule,
    FileStorageModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    FileService,
    FileMetadataService,
    FilesFieldService,
    FileResolver,
    FilePathGuard,
    FileAttachmentListener,
    FileWorkspaceMemberListener,
    FilesFieldDeletionListener,
    FileWorkspaceFolderDeletionJob,
    FileDeletionJob,
    FilesFieldDeletionJob,
    FileUploadService,
  ],
  exports: [FileService, FileMetadataService, FilesFieldService],
  controllers: [FileController],
})
export class FileModule {}
