import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FilePathGuard } from 'src/engine/core-modules/file/guards/file-path-guard';
import { FileDeletionJob } from 'src/engine/core-modules/file/jobs/file-deletion.job';
import { FileWorkspaceFolderDeletionJob } from 'src/engine/core-modules/file/jobs/file-workspace-folder-deletion.job';
import { FileAttachmentListener } from 'src/engine/core-modules/file/listeners/file-attachment.listener';
import { FileWorkspaceMemberListener } from 'src/engine/core-modules/file/listeners/file-workspace-member.listener';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

import { FileByIdController } from './controllers/file-by-id.controller';
import { FileController } from './controllers/file.controller';
import { FileEntity } from './entities/file.entity';
import { FileCorePictureModule } from './file-core-picture/file-core-picture.module';
import { FileUploadService } from './file-upload/services/file-upload.service';
import { FileUrlModule } from './file-url/file-url.module';
import { FileWorkflowModule } from './file-workflow/file-workflow.module';
import { FilesFieldModule } from './files-field/files-field.module';
import { FileByIdGuard } from './guards/file-by-id.guard';
import { FileResolver } from './resolvers/file.resolver';
import { FileMetadataService } from './services/file-metadata.service';
import { FileService } from './services/file.service';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([FileEntity, WorkspaceEntity, ApplicationEntity]),
    PermissionsModule,
    FileStorageModule,
    FileUrlModule,
    FilesFieldModule,
    FileCorePictureModule,
    FileWorkflowModule,
    SecureHttpClientModule,
  ],
  providers: [
    FileService,
    FileMetadataService,
    FileResolver,
    FilePathGuard,
    FileByIdGuard,
    FileAttachmentListener,
    FileWorkspaceMemberListener,
    FileWorkspaceFolderDeletionJob,
    FileDeletionJob,
    FileUploadService,
  ],
  exports: [
    FileService,
    FileMetadataService,
    FileUrlModule,
    FilesFieldModule,
    FileCorePictureModule,
    FileWorkflowModule,
    FileUploadService,
  ],
  controllers: [FileController, FileByIdController],
})
export class FileModule {}
