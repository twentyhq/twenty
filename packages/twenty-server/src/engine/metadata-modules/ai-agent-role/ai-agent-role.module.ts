import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AgentEntity } from 'src/engine/metadata-modules/ai-agent/entities/agent.entity';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

import { AiAgentRoleService } from './ai-agent-role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentEntity, RoleEntity, RoleTargetsEntity]),
  ],
  providers: [AiAgentRoleService],
  exports: [AiAgentRoleService],
})
export class AiAgentRoleModule {}
