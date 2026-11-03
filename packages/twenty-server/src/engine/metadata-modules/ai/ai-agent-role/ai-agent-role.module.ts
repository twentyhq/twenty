import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { AgentRoleInitializationService } from 'src/engine/metadata-modules/ai/ai-agent-role/agent-role-initialization.service';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleTargetModule } from 'src/engine/metadata-modules/role-target/role-target.module';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { AiAgentRoleService } from './ai-agent-role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentEntity, RoleEntity, RoleTargetEntity]),
    ApplicationModule,
    CacheLockModule,
    RoleTargetModule,
    WorkspaceMigrationModule,
    WorkspaceCacheModule,
  ],
  providers: [
    AiAgentRoleService,
    AgentRoleInitializationService,
    provideWorkspaceScopedRepository(AgentEntity),
    provideWorkspaceScopedRepository(RoleEntity),
    provideWorkspaceScopedRepository(RoleTargetEntity),
  ],
  exports: [AiAgentRoleService, AgentRoleInitializationService],
})
export class AiAgentRoleModule {}
