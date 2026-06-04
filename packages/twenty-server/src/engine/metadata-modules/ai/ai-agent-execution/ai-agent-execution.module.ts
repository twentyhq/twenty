import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

import { AgentMessagePartEntity } from './entities/agent-message-part.entity';
import { AgentMessageEntity } from './entities/agent-message.entity';
import { AgentTurnEntity } from './entities/agent-turn.entity';
import { AgentMessagePartResolver } from './resolvers/agent-message-part.resolver';
import { AgentRunResolver } from './resolvers/agent-run.resolver';
import { AgentActorContextService } from './services/agent-actor-context.service';
import { AgentAsyncExecutorService } from './services/agent-async-executor.service';
import { AgentRunService } from './services/agent-run.service';

@Module({
  imports: [
    AiBillingModule,
    AiModelsModule,
    AiAgentModule,
    ApplicationModule,
    BillingModule,
    FileUrlModule,
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
      WorkspaceEntity,
    ]),
  ],
  providers: [
    AgentAsyncExecutorService,
    AgentActorContextService,
    AgentMessagePartResolver,
    AgentRunResolver,
    AgentRunService,
    provideWorkspaceScopedRepository(RoleTargetEntity),
    provideWorkspaceScopedRepository(AgentEntity),
  ],
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
