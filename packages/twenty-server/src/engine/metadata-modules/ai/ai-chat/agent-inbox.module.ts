import { Module } from '@nestjs/common';

import { AgentChatThreadModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread.module';
import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [AgentChatThreadModule, AgentHistoryModule, WorkspaceCacheModule],
  providers: [AgentInboxService],
  exports: [AgentInboxService],
})
export class AgentInboxModule {}
