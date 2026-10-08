import { Module } from '@nestjs/common';

import { FileEmailAttachmentService } from 'src/engine/core-modules/file/file-email-attachment/services/file-email-attachment.service';

@Module({
  providers: [FileEmailAttachmentService],
  exports: [FileEmailAttachmentService],
})
export class FileEmailAttachmentModule {}
