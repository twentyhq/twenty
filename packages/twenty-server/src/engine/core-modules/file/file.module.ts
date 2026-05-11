import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileAiChatModule } from 'src/engine/core-modules/file/file-ai-chat/file-ai-chat.module';
import { FilePathGuard } from 'src/engine/core-modules/file/guards/file-path-guard';
import { FileDeletionJob } from 'src/engine/core-modules/file/jobs/file-deletion.job';
import { FileWorkspaceFolderDeletionJob } from 'src/engine/core-modules/file/jobs/file-workspace-folder-deletion.job';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

import { FileController } from './controllers/file.controller';
import { FileEntity } from './entities/file.entity';
import { FileCorePictureModule } from './file-core-picture/file-core-picture.module';
import { FileEmailAttachmentModule } from './file-email-attachment/file-email-attachment.module';
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
    SecureHttpClientModule,
  ],
  providers: [
    FileService,
    FilePathGuard,
    FileByIdGuard,
    FileWorkspaceFolderDeletionJob,
    FileDeletionJob,
  ],
  exports: [
    FileService,
    FileUrlModule,
    FilesFieldModule,
    FileCorePictureModule,
    FileWorkflowModule,
    FileAiChatModule,
    FileEmailAttachmentModule,
  ],
  controllers: [FileController],
})
export class FileModule {}
