import { Module } from '@nestjs/common';

import { AgentChatThreadDestroyedListener } from 'src/engine/metadata-modules/ai/ai-chat/listeners/agent-chat-thread-destroyed.listener';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

// Separate from AiChatModule so the record API's query hooks avoid its tool and
// workflow dependencies
@Module({
  imports: [AgentHistoryModule, WorkspaceCacheModule],
  providers: [
    AgentChatThreadDestroyedListener,
    AgentChatThreadLifecycleService,
    AgentChatThreadRecordEventService,
  ],
  exports: [AgentChatThreadLifecycleService, AgentChatThreadRecordEventService],
})
export class AgentChatThreadLifecycleModule {}
