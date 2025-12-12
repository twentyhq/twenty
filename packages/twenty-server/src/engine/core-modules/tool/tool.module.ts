import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { SearchHelpCenterTool } from 'src/engine/core-modules/tool/tools/search-help-center-tool/search-help-center-tool';
import { SendEmailTool } from 'src/engine/core-modules/tool/tools/send-email-tool/send-email-tool';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';

@Module({
  imports: [
    MessagingImportManagerModule,
    TypeOrmModule.forFeature([FileEntity]),
    FileModule,
  ],
  providers: [HttpTool, SendEmailTool, SearchHelpCenterTool],
  exports: [HttpTool, SendEmailTool, SearchHelpCenterTool],
})
export class ToolModule {}
