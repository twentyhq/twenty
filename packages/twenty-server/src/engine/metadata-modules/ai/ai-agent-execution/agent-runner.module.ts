import { Module } from '@nestjs/common';

import { AgentRunConversationModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/agent-run-conversation.module';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';

@Module({
  imports: [
    AgentHistoryModule,
    AgentRunConversationModule,
    AiAgentExecutionModule,
  ],
  providers: [AgentRunnerService],
  exports: [AgentRunnerService, AgentRunConversationModule],
})
export class AgentRunnerModule {}
