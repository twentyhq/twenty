import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FileAIChatResolver } from 'src/engine/core-modules/file/file-ai-chat/resolvers/file-ai-chat.resolver';
import { FileAIChatService } from 'src/engine/core-modules/file/file-ai-chat/services/file-ai-chat.service';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [FileUrlModule, ApplicationModule, PermissionsModule],
  providers: [FileAIChatService, FileAIChatResolver],
  exports: [FileAIChatService],
})
export class FileAIChatModule {}
