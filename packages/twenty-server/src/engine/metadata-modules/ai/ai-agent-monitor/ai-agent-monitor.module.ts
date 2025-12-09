import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AiChatModule } from 'src/engine/metadata-modules/ai/ai-chat/ai-chat.module';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

import { EvaluateAgentTurnJob } from './jobs/evaluate-agent-turn.job';
import { RunEvaluationInputJob } from './jobs/run-evaluation-input.job';
import { AgentTurnEvaluationEntity } from './entities/agent-turn-evaluation.entity';
import { AgentTurnResolver } from './resolvers/agent-turn.resolver';
import { AgentTurnGraderService } from './services/agent-turn-grader.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgentTurnEvaluationEntity,
      AgentTurnEntity,
      AgentEntity,
      AgentChatThreadEntity,
    ]),
    AiAgentModule,
    AiAgentExecutionModule,
    AiChatModule,
    AiModelsModule,
    PermissionsModule,
  ],
  providers: [
    AgentTurnGraderService,
    AgentTurnResolver,
    EvaluateAgentTurnJob,
    RunEvaluationInputJob,
  ],
  exports: [AgentTurnGraderService],
})
export class AiAgentMonitorModule {}
