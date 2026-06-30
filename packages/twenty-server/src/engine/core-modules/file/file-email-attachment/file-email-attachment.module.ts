import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FileEmailAttachmentResolver } from 'src/engine/core-modules/file/file-email-attachment/resolvers/file-email-attachment.resolver';
import { FileEmailAttachmentService } from 'src/engine/core-modules/file/file-email-attachment/services/file-email-attachment.service';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [FileUrlModule, ApplicationModule, PermissionsModule],
  providers: [FileEmailAttachmentService, FileEmailAttachmentResolver],
  exports: [FileEmailAttachmentService],
})
export class FileEmailAttachmentModule {}
