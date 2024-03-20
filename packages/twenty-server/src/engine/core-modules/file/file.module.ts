import { Module } from '@nestjs/common';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { FilePathGuard } from 'src/engine/core-modules/file/guards/file-path-guard';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';

import { FileService } from './services/file.service';
import { FileController } from './controllers/file.controller';

@Module({
  imports: [FileUploadModule, AuthModule],
  providers: [FileService, EnvironmentService, FilePathGuard],
  exports: [FileService],
  controllers: [FileController],
})
export class FileModule {}
