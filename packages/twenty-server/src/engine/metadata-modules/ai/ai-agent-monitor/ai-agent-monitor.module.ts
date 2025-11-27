import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AiChatModule } from 'src/engine/metadata-modules/ai/ai-chat/ai-chat.module';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

import { AgentTurnEvaluationEntity } from './entities/agent-turn-evaluation.entity';
import { AgentTurnResolver } from './resolvers/agent-turn.resolver';
import { AgentTurnGraderService } from './services/agent-turn-grader.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgentTurnEvaluationEntity,
      AgentEntity,
      AgentChatThreadEntity,
    ]),
    AiAgentModule,
    AiAgentExecutionModule,
    AiChatModule,
    AiModelsModule,
    PermissionsModule,
  ],
  providers: [AgentTurnGraderService, AgentTurnResolver],
  exports: [AgentTurnGraderService],
})
export class AiAgentMonitorModule {}
