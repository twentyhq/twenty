import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { AiToolsModule } from 'src/engine/metadata-modules/ai/ai-tools/ai-tools.module';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';

import { AgentMessagePartEntity } from './entities/agent-message-part.entity';
import { AgentMessageEntity } from './entities/agent-message.entity';
import { AgentTurnEntity } from './entities/agent-turn.entity';
import { AgentAsyncExecutorService } from './services/agent-async-executor.service';

@Module({
  imports: [
    AiBillingModule,
    AiModelsModule,
    AiToolsModule,
    TypeOrmModule.forFeature([
      AgentMessageEntity,
      AgentMessagePartEntity,
      AgentTurnEntity,
      RoleTargetEntity,
    ]),
  ],
  providers: [AgentAsyncExecutorService],
  exports: [
    AgentAsyncExecutorService,
    TypeOrmModule.forFeature([
      AgentMessageEntity,
      AgentMessagePartEntity,
      AgentTurnEntity,
    ]),
  ],
})
export class AiAgentExecutionModule {}
