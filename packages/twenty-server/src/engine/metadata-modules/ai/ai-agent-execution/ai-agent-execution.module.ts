import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { AiToolsModule } from 'src/engine/metadata-modules/ai/ai-tools/ai-tools.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowToolsModule } from 'src/modules/workflow/workflow-tools/workflow-tools.module';

import { AgentMessagePartEntity } from './entities/agent-message-part.entity';
import { AgentMessageEntity } from './entities/agent-message.entity';
import { AgentTurnEntity } from './entities/agent-turn.entity';
import { AgentActorContextService } from './services/agent-actor-context.service';
import { AgentAsyncExecutorService } from './services/agent-async-executor.service';
import { AgentExecutionService } from './services/agent-execution.service';
import { AgentModelConfigService } from './services/agent-model-config.service';
import { AgentPlanExecutorService } from './services/agent-plan-executor.service';
import { AgentToolGeneratorService } from './services/agent-tool-generator.service';

@Module({
  imports: [
    AiBillingModule,
    AiModelsModule,
    AiToolsModule,
    AiAgentModule,
    WorkspaceDomainsModule,
    UserWorkspaceModule,
    UserRoleModule,
    PermissionsModule,
    WorkflowToolsModule,
    WorkspaceCacheModule,
    TypeOrmModule.forFeature([
      AgentEntity,
      AgentMessageEntity,
      AgentMessagePartEntity,
      AgentTurnEntity,
      RoleTargetEntity,
    ]),
  ],
  providers: [
    AgentAsyncExecutorService,
    AgentExecutionService,
    AgentToolGeneratorService,
    AgentModelConfigService,
    AgentActorContextService,
    AgentPlanExecutorService,
  ],
  exports: [
    AgentAsyncExecutorService,
    AgentExecutionService,
    AgentPlanExecutorService,
    AgentToolGeneratorService,
    AgentActorContextService,
    AgentModelConfigService,
    TypeOrmModule.forFeature([
      AgentMessageEntity,
      AgentMessagePartEntity,
      AgentTurnEntity,
    ]),
  ],
})
export class AiAgentExecutionModule {}
