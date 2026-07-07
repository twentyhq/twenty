import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUploadController } from 'src/engine/core-modules/file/file-upload/controllers/file-upload.controller';
import { PendingFileCleanupCronCommand } from 'src/engine/core-modules/file/file-upload/crons/commands/pending-file-cleanup.cron.command';
import { PendingFileCleanupCronJob } from 'src/engine/core-modules/file/file-upload/crons/jobs/pending-file-cleanup.cron.job';
import { FileUploadTokenGuard } from 'src/engine/core-modules/file/file-upload/guards/file-upload-token.guard';
import { FileUploadResolver } from 'src/engine/core-modules/file/file-upload/resolvers/file-upload.resolver';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { PendingFileCleanupService } from 'src/engine/core-modules/file/file-upload/services/pending-file-cleanup.service';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([
      FileEntity,
      ApplicationEntity,
      FieldMetadataEntity,
    ]),
    PermissionsModule,
    FileStorageModule,
    FileUrlModule,
    ApplicationModule,
  ],
  providers: [
    FileUploadService,
    FileUploadResolver,
    FileUploadTokenGuard,
    PendingFileCleanupService,
    PendingFileCleanupCronJob,
    PendingFileCleanupCronCommand,
    provideWorkspaceScopedRepository(FileEntity),
  ],
  exports: [FileUploadService, PendingFileCleanupCronCommand],
  controllers: [FileUploadController],
})
export class FileUploadModule {}
