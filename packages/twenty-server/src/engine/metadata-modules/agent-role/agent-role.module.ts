import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleTargetV2Module } from 'src/engine/metadata-modules/role-target/role-target-v2.module';

import { AgentRoleService } from './agent-role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentEntity, RoleEntity, RoleTargetsEntity]),
    RoleTargetV2Module,
  ],
  providers: [AgentRoleService],
  exports: [AgentRoleService],
})
export class AgentRoleModule {}
