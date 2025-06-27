import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModule } from 'src/engine/core-modules/ai/ai.module';
import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';

import { AgentExecutionService } from './agent-execution.service';
import { AgentToolService } from './agent-tool.service';
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
    ObjectMetadataModule,
    WorkspacePermissionsCacheModule,
  ],
  providers: [
    AgentResolver,
    AgentService,
    AgentExecutionService,
    AgentToolService,
  ],
  exports: [
    AgentService,
    AgentExecutionService,
    AgentToolService,
    TypeOrmModule.forFeature([AgentEntity], 'core'),
  ],
})
export class AgentModule {}
