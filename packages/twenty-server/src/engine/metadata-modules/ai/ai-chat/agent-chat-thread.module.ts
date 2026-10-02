import { Module } from '@nestjs/common';

import { RecordShareStorageModule } from 'src/engine/core-modules/record-share/record-share-storage.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { AgentChatThreadLifecycleModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread-lifecycle.module';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RecordPermissionsModule } from 'src/engine/metadata-modules/record-permissions/record-permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

// separate from AiChatModule so workflow actions can open and update member
// chats without its streaming, tool and workflow dependencies
@Module({
  imports: [
    AgentChatThreadLifecycleModule,
    AgentHistoryModule,
    PermissionsModule,
    RecordPermissionsModule,
    RecordShareStorageModule,
    UserWorkspaceModule,
    WorkspaceCacheModule,
  ],
  providers: [AgentChatSharingService, AgentChatThreadService],
  exports: [AgentChatSharingService, AgentChatThreadService],
})
export class AgentChatThreadModule {}
