import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { PendingWakeUpModule } from 'src/engine/core-modules/pending-wake-up/pending-wake-up.module';
import { AgentRunSuspensionEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-run-suspension.entity';
import { AgentCallerConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-caller-conversation.service';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { AgentChatThreadLifecycleModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread-lifecycle.module';
import { AgentChatThreadModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread.module';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

// separate from AiAgentExecutionModule so workflow runs can record, suspend and close
// conversations and register as callers without its tool dependencies, which reach back to workflows
@Module({
  imports: [
    AgentChatThreadLifecycleModule,
    AgentChatThreadModule,
    AgentHistoryModule,
    CacheLockModule,
    PendingWakeUpModule,
    TypeOrmModule.forFeature([AgentRunSuspensionEntity]),
  ],
  providers: [
    AgentCallerConversationService,
    AgentRunCallerHandlerRegistryService,
    AgentRunConversationService,
    AgentRunSuspensionService,
    provideWorkspaceScopedRepository(AgentRunSuspensionEntity),
  ],
  exports: [
    AgentCallerConversationService,
    AgentRunCallerHandlerRegistryService,
    AgentRunConversationService,
    AgentRunSuspensionService,
  ],
})
export class AgentRunConversationModule {}
