import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilePathGuard } from 'src/engine/core-modules/file/guards/file-path-guard';
import { FileDeletionJob } from 'src/engine/core-modules/file/jobs/file-deletion.job';
import { FileWorkspaceFolderDeletionJob } from 'src/engine/core-modules/file/jobs/file-workspace-folder-deletion.job';
import { FileAttachmentListener } from 'src/engine/core-modules/file/listeners/file-attachment.listener';
import { FileWorkspaceMemberListener } from 'src/engine/core-modules/file/listeners/file-workspace-member.listener';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { FileController } from './controllers/file.controller';
import { CleanupOrphanedFilesCronCommand } from './crons/commands/cleanup-orphaned-files.cron.command';
import { CleanupOrphanedFilesCronJob } from './crons/jobs/cleanup-orphaned-files.cron.job';
import { FileEntity } from './entities/file.entity';
import { FileUploadService } from './file-upload/services/file-upload.service';
import { FileResolver } from './resolvers/file.resolver';
import { FileMetadataService } from './services/file-metadata.service';
import { FileService } from './services/file.service';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([FileEntity, Workspace], 'core'),
    HttpModule,
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
    CleanupOrphanedFilesCronJob,
    CleanupOrphanedFilesCronCommand,
    FileUploadService,
  ],
  exports: [FileService, FileMetadataService, CleanupOrphanedFilesCronCommand],
  controllers: [FileController],
})
export class FileModule {}
