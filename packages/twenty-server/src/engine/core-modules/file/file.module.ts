import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilePathGuard } from 'src/engine/core-modules/file/guards/file-path-guard';
import { FileDeletionJob } from 'src/engine/core-modules/file/jobs/file-deletion.job';
import { FileWorkspaceFolderDeletionJob } from 'src/engine/core-modules/file/jobs/file-workspace-folder-deletion.job';
import { FileAttachmentListener } from 'src/engine/core-modules/file/listeners/file-attachment.listener';
import { FileWorkspaceMemberListener } from 'src/engine/core-modules/file/listeners/file-workspace-member.listener';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';

import { FileController } from './controllers/file.controller';
import { FileEntity } from './entities/file.entity';
import { FileMetadataService } from './services/file-metadata.service';
import { FileService } from './services/file.service';

@Module({
  imports: [JwtModule, TypeOrmModule.forFeature([FileEntity], 'core')],
  providers: [
    FileService,
    FileMetadataService,
    FilePathGuard,
    FileAttachmentListener,
    FileWorkspaceMemberListener,
    FileWorkspaceFolderDeletionJob,
    FileDeletionJob,
  ],
  exports: [FileService, FileMetadataService],
  controllers: [FileController],
})
export class FileModule {}
