import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleTargetModule } from 'src/engine/metadata-modules/role-target/role-target.module';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

import { AiAgentRoleService } from './ai-agent-role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentEntity, RoleEntity, RoleTargetEntity]),
    RoleTargetModule,
  ],
  providers: [AiAgentRoleService],
  exports: [AiAgentRoleService],
})
export class AiAgentRoleModule {}
