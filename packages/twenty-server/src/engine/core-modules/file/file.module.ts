import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileAiChatModule } from 'src/engine/core-modules/file/file-ai-chat/file-ai-chat.module';
import { FileDeletionJob } from 'src/engine/core-modules/file/jobs/file-deletion.job';
import { FileWorkspaceFolderDeletionJob } from 'src/engine/core-modules/file/jobs/file-workspace-folder-deletion.job';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { FileController } from './controllers/file.controller';
import { FileEntity } from './entities/file.entity';
import { FileCorePictureModule } from './file-core-picture/file-core-picture.module';
import { FileEmailAttachmentModule } from './file-email-attachment/file-email-attachment.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { FileUrlModule } from './file-url/file-url.module';
import { FileWorkflowModule } from './file-workflow/file-workflow.module';
import { FilesFieldModule } from './files-field/files-field.module';
import { FileByIdGuard } from './guards/file-by-id.guard';
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
    FileAiChatModule,
    FileEmailAttachmentModule,
    FileUploadModule,
    SecureHttpClientModule,
  ],
  providers: [
    FileService,
    FileByIdGuard,
    FileWorkspaceFolderDeletionJob,
    FileDeletionJob,
    provideWorkspaceScopedRepository(FileEntity),
  ],
  exports: [
    FileService,
    FileUrlModule,
    FilesFieldModule,
    FileCorePictureModule,
    FileWorkflowModule,
    FileAiChatModule,
    FileEmailAttachmentModule,
    FileUploadModule,
  ],
  controllers: [FileController],
})
export class FileModule {}
