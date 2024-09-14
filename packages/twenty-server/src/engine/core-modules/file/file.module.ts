import { Module } from '@nestjs/common';

import { FilePathGuard } from 'src/engine/core-modules/file/guards/file-path-guard';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

import { FileController } from './controllers/file.controller';
import { FileService } from './services/file.service';

@Module({
  imports: [JwtModule],
  providers: [FileService, EnvironmentService, FilePathGuard],
  exports: [FileService],
  controllers: [FileController],
})
export class FileModule {}
