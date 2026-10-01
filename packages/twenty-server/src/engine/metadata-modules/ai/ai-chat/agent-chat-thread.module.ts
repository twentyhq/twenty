import { Module } from '@nestjs/common';

import { RecordShareModule } from 'src/engine/core-modules/record-share/record-share.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { AgentChatThreadLifecycleModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread-lifecycle.module';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

// separate from AiChatModule so workflow actions can open and update member
// chats without its streaming, tool and workflow dependencies
@Module({
  imports: [
    AgentChatThreadLifecycleModule,
    AgentHistoryModule,
    PermissionsModule,
    RecordShareModule,
    UserWorkspaceModule,
    WorkspaceCacheModule,
  ],
  providers: [AgentChatSharingService, AgentChatThreadService],
  exports: [AgentChatSharingService, AgentChatThreadService],
})
export class AgentChatThreadModule {}
