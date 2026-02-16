import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileAgentChatResolver } from 'src/engine/core-modules/file/file-agent-chat/resolvers/file-agent-chat.resolver';
import { FileAgentChatService } from 'src/engine/core-modules/file/file-agent-chat/file-agent-chat.service';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    JwtModule,
    PermissionsModule,
    FileStorageModule,
    ApplicationModule,
    FileUrlModule,
  ],
  providers: [FileAgentChatService, FileAgentChatResolver],
  exports: [FileAgentChatService],
})
export class FileAgentChatModule {}
