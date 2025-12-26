import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

import { AgentMessagePartEntity } from './entities/agent-message-part.entity';
import { AgentMessageEntity } from './entities/agent-message.entity';
import { AgentTurnEntity } from './entities/agent-turn.entity';
import { AgentActorContextService } from './services/agent-actor-context.service';
import { AgentAsyncExecutorService } from './services/agent-async-executor.service';

@Module({
  imports: [
    AiBillingModule,
    AiModelsModule,
    AiAgentModule,
    WorkspaceDomainsModule,
    UserWorkspaceModule,
    UserRoleModule,
    PermissionsModule,
    WorkspaceCacheModule,
    forwardRef(() => ToolProviderModule),
    TypeOrmModule.forFeature([
      AgentEntity,
      AgentMessageEntity,
      AgentMessagePartEntity,
      AgentTurnEntity,
      RoleTargetEntity,
    ]),
  ],
  providers: [AgentAsyncExecutorService, AgentActorContextService],
  exports: [
    AgentAsyncExecutorService,
    AgentActorContextService,
    TypeOrmModule.forFeature([
      AgentMessageEntity,
      AgentMessagePartEntity,
      AgentTurnEntity,
    ]),
  ],
})
export class AiAgentExecutionModule {}
