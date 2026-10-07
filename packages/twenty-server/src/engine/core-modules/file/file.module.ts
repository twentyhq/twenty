import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileDeletionJob } from 'src/engine/core-modules/file/jobs/file-deletion.job';
import { FileWorkspaceFolderDeletionJob } from 'src/engine/core-modules/file/jobs/file-workspace-folder-deletion.job';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { FileEntity } from './entities/file.entity';
import { FileCorePictureModule } from './file-core-picture/file-core-picture.module';
import { FileEmailAttachmentModule } from './file-email-attachment/file-email-attachment.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { FileUrlModule } from './file-url/file-url.module';
import { FilesFieldModule } from './files-field/files-field.module';
import { FileService } from './services/file.service';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([FileEntity, ApplicationEntity]),
    FileUrlModule,
    FilesFieldModule,
    FileCorePictureModule,
    FileEmailAttachmentModule,
    FileUploadModule,
  ],
  providers: [
    FileService,
    FileWorkspaceFolderDeletionJob,
    FileDeletionJob,
    provideWorkspaceScopedRepository(FileEntity),
    provideWorkspaceScopedRepository(ApplicationEntity),
  ],
  exports: [
    FileService,
    FileUrlModule,
    FileCorePictureModule,
    FileUploadModule,
  ],
})
export class FileModule {}
