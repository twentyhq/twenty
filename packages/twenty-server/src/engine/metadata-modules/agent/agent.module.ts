import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModule } from 'src/engine/core-modules/ai/ai.module';
import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';

import { AgentExecutionService } from './agent-execution.service';
import { AgentEntity } from './agent.entity';
import { AgentResolver } from './agent.resolver';
import { AgentService } from './agent.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentEntity, FeatureFlag], 'core'),
    AiModule,
    ThrottlerModule,
    AuditModule,
    FeatureFlagModule,
  ],
  providers: [AgentResolver, AgentService, AgentExecutionService],
  exports: [
    AgentService,
    AgentExecutionService,
    TypeOrmModule.forFeature([AgentEntity], 'core'),
  ],
})
export class AgentModule {}
