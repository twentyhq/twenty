import { Injectable, NotFoundException } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  type RunAgentMessage,
  type RunAgentResult,
} from 'twenty-shared/application';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { AGENT_RUN_BASE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-run-base-system-prompt.const';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type RunAgentServiceInput = {
  agentUniversalIdentifier: string;
  prompt?: string | null;
  messages?: RunAgentMessage[] | null;
};

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
    input: RunAgentServiceInput;
  }): Promise<RunAgentResult> {
    const prompt = input.prompt;
    const messages = input.messages;

    // GraphQL cannot express XOR; enforce exactly one of prompt or messages
    if (isNonEmptyArray(messages) === isNonEmptyString(prompt)) {
      throw new AiException(
        'Provide exactly one of prompt or messages',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

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

    const sharedExecuteAgentArgs = {
      agent,
      baseSystemPrompt: AGENT_RUN_BASE_SYSTEM_PROMPT,
      authContext,
      workspaceId: workspace.id,
      userWorkspaceId: requestUserWorkspaceId,
      operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
    };

    let executionResult: AgentExecutionResult;

    if (isNonEmptyArray(messages)) {
      executionResult = await this.agentAsyncExecutorService.executeAgent({
        ...sharedExecuteAgentArgs,
        messages,
      });
    } else if (isNonEmptyString(prompt)) {
      executionResult = await this.agentAsyncExecutorService.executeAgent({
        ...sharedExecuteAgentArgs,
        userPrompt: prompt,
      });
    } else {
      throw new AiException(
        'Provide exactly one of prompt or messages',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    if (executionResult.hasNoMoreAvailableCredits) {
      return {
        result: null,
        error: 'AI agent stopped: no more available credits.',
        success: false,
      };
    }

    return {
      result: executionResult.result,
      error: null,
      success: true,
    };
  }
}
