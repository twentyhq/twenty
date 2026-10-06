import { Module } from '@nestjs/common';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { AgentCallerConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-caller-conversation.service';
import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { AgentChatThreadLifecycleModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread-lifecycle.module';
import { AgentChatThreadModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread.module';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';

// separate from AiAgentExecutionModule so workflow runs can record and close
// conversations without its tool dependencies, which reach back to workflows
@Module({
  imports: [
    AgentChatThreadLifecycleModule,
    AgentChatThreadModule,
    AgentHistoryModule,
    CacheLockModule,
  ],
  providers: [AgentCallerConversationService, AgentRunConversationService],
  exports: [AgentCallerConversationService, AgentRunConversationService],
})
export class AgentRunConversationModule {}
