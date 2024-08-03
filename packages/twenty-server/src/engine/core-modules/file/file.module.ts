import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FilePathGuard } from 'src/engine/core-modules/file/guards/file-path-guard';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

import { FileController } from './controllers/file.controller';
import { FileService } from './services/file.service';

@Module({
  imports: [FileUploadModule, forwardRef(() => AuthModule)],
  providers: [FileService, EnvironmentService, FilePathGuard],
  exports: [FileService],
  controllers: [FileController],
})
export class FileModule {}
