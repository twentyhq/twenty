import { Module } from '@nestjs/common';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { FileUploadResolver } from 'src/engine/core-modules/file/file-upload/resolvers/file-upload.resolver';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';

@Module({
  providers: [FileUploadService, FileUploadResolver, EnvironmentService],
  exports: [FileUploadService, FileUploadResolver],
})
export class FileUploadModule {}
