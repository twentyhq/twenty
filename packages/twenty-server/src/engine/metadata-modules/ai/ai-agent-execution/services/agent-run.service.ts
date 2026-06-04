import { Injectable, NotFoundException } from '@nestjs/common';

import {
  type RunAgentInput,
  type RunAgentResult,
} from 'twenty-shared/application';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class AgentRunService {
  constructor(
    private readonly agentAsyncExecutorService: AgentAsyncExecutorService,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
  ) {}

  async run({
    workspace,
    application,
    requestUserWorkspaceId,
    input,
  }: {
    workspace: FlatWorkspace;
    application: FlatApplication;
    requestUserWorkspaceId: string | null;
    input: RunAgentInput;
  }): Promise<RunAgentResult> {
    const agent = await this.agentRepository.findOne(workspace.id, {
      where: {
        universalIdentifier: input.agentUniversalIdentifier,
        applicationId: application.id,
      },
    });

    if (!agent) {
      throw new NotFoundException(
        `Agent ${input.agentUniversalIdentifier} not found for this application`,
      );
    }

    const authContext: WorkspaceAuthContext = {
      type: 'application',
      workspace,
      application,
    };

    const { result, hasNoMoreAvailableCredits } =
      await this.agentAsyncExecutorService.executeAgent({
        agent,
        userPrompt: input.prompt,
        authContext,
        workspaceId: workspace.id,
        userWorkspaceId: requestUserWorkspaceId,
        operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
      });

    return { result, hasNoMoreAvailableCredits };
  }
}
