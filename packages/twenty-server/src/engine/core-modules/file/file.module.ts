import { Module } from '@nestjs/common';

import { FilePathGuard } from 'src/engine/core-modules/file/guards/file-path-guard';
import { FileDeletionJob } from 'src/engine/core-modules/file/jobs/file-deletion.job';
import { FileWorkspaceFolderDeletionJob } from 'src/engine/core-modules/file/jobs/file-workspace-folder-deletion.job';
import { FileAttachmentListener } from 'src/engine/core-modules/file/listeners/file-attachment.listener';
import { FileWorkspaceMemberListener } from 'src/engine/core-modules/file/listeners/file-workspace-member.listener';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { FileController } from './controllers/file.controller';
import { FileService } from './services/file.service';

@Module({
  imports: [JwtModule],
  providers: [
    FileService,
    TwentyConfigService,
    FilePathGuard,
    FileAttachmentListener,
    FileWorkspaceMemberListener,
    FileWorkspaceFolderDeletionJob,
    FileDeletionJob,
  ],
  exports: [FileService],
  controllers: [FileController],
})
export class FileModule {}
