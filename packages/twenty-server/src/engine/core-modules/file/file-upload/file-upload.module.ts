import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { FileUploadResolver } from 'src/engine/core-modules/file/file-upload/resolvers/file-upload.resolver';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [FileModule, HttpModule, PermissionsModule],
  providers: [FileUploadService, FileUploadResolver],
  exports: [FileUploadService, FileUploadResolver],
})
export class FileUploadModule {}
