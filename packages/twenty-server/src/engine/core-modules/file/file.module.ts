import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilePathGuard } from 'src/engine/core-modules/file/guards/file-path-guard';
import { FileDeletionJob } from 'src/engine/core-modules/file/jobs/file-deletion.job';
import { FileWorkspaceFolderDeletionJob } from 'src/engine/core-modules/file/jobs/file-workspace-folder-deletion.job';
import { FileAttachmentListener } from 'src/engine/core-modules/file/listeners/file-attachment.listener';
import { FileWorkspaceMemberListener } from 'src/engine/core-modules/file/listeners/file-workspace-member.listener';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

import { FileController } from './controllers/file.controller';
import { FileEntity } from './entities/file.entity';
import { FileUploadService } from './file-upload/services/file-upload.service';
import { FileResolver } from './resolvers/file.resolver';
import { FileMetadataService } from './services/file-metadata.service';
import { FileService } from './services/file.service';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([FileEntity, WorkspaceEntity]),
    HttpModule,
    PermissionsModule,
  ],
  providers: [
    FileService,
    FileMetadataService,
    FileResolver,
    FilePathGuard,
    FileAttachmentListener,
    FileWorkspaceMemberListener,
    FileWorkspaceFolderDeletionJob,
    FileDeletionJob,
    FileUploadService,
  ],
  exports: [FileService, FileMetadataService],
  controllers: [FileController],
})
export class FileModule {}
