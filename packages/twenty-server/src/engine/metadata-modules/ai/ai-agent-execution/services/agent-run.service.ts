import { Injectable, NotFoundException } from '@nestjs/common';

import {
  type RunAgentInput,
  type RunAgentResult,
} from 'twenty-shared/application';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
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
    private readonly applicationService: ApplicationService,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
  ) {}

  async run({
    workspace,
    requestUserWorkspaceId,
    input,
  }: {
    workspace: FlatWorkspace;
    requestUserWorkspaceId: string | null;
    input: RunAgentInput;
  }): Promise<RunAgentResult> {
    const agent = await this.agentRepository.findOne(workspace.id, {
      where: {
        universalIdentifier: input.agentUniversalIdentifier,
      },
    });

    if (!agent) {
      throw new NotFoundException(
        `Agent ${input.agentUniversalIdentifier} not found`,
      );
    }

    const application = await this.applicationService.findById(
      agent.applicationId,
    );

    if (!application) {
      throw new NotFoundException(
        `Application ${agent.applicationId} not found for agent ${input.agentUniversalIdentifier}`,
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

    if (hasNoMoreAvailableCredits) {
      return {
        result: null,
        error: 'AI agent stopped: no more available credits.',
        success: false,
      };
    }

    return { result, error: null, success: true };
  }
}
