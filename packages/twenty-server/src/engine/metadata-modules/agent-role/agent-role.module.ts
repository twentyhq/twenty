import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { AgentModule } from 'src/engine/metadata-modules/agent/agent.module';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

import { AgentRoleService } from './agent-role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [AgentEntity, RoleEntity, RoleTargetsEntity],
      'core',
    ),
    AgentModule,
  ],
  providers: [AgentRoleService],
  exports: [AgentRoleService],
})
export class AgentRoleModule {}
