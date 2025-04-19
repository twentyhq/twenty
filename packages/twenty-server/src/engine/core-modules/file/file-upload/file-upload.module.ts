import { Module } from '@nestjs/common';

import { FileUploadResolver } from 'src/engine/core-modules/file/file-upload/resolvers/file-upload.resolver';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileModule } from 'src/engine/core-modules/file/file.module';

@Module({
  imports: [FileModule],
  providers: [FileUploadService, FileUploadResolver],
  exports: [FileUploadService, FileUploadResolver],
})
export class FileUploadModule {}
