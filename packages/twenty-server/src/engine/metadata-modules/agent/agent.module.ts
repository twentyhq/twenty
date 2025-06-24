import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModule } from 'src/engine/core-modules/ai/ai.module';
import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

import { AgentExecutionService } from './agent-execution.service';
import { AgentEntity } from './agent.entity';
import { AgentResolver } from './agent.resolver';
import { AgentService } from './agent.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [AgentEntity, RoleEntity, RoleTargetsEntity],
      'core',
    ),
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
