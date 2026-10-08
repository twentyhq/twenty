import { Module } from '@nestjs/common';

import { AgentChatThreadLifecycleListener } from 'src/engine/metadata-modules/ai/ai-chat/listeners/agent-chat-thread-lifecycle.listener';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';

// separate from AiChatModule so the record API's query hooks avoid its tool and workflow dependencies
@Module({
  imports: [AgentHistoryModule],
  providers: [
    AgentChatThreadLifecycleListener,
    AgentChatThreadLifecycleService,
  ],
  exports: [AgentChatThreadLifecycleService],
})
export class AgentChatThreadLifecycleModule {}
