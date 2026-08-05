import { Injectable, Logger, NotFoundException } from '@nestjs/common';

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
  private readonly logger = new Logger(AgentRunService.name);

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

    // GraphQL cannot express XOR; enforce exactly one of prompt or messages
    if (isNonEmptyArray(input.messages) === isNonEmptyString(prompt)) {
      throw new AiException(
        'Provide exactly one of prompt or messages',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    const messages: RunAgentMessage[] = isNonEmptyString(prompt)
      ? [{ role: 'user', content: prompt }]
      : (input.messages ?? []);

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

    try {
      const executionResult = await this.agentAsyncExecutorService.executeAgent(
        {
          agent,
          messages,
          baseSystemPrompt: AGENT_RUN_BASE_SYSTEM_PROMPT,
          authContext,
          workspaceId: workspace.id,
          userWorkspaceId: requestUserWorkspaceId,
          operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
          toolLoadingStrategy: 'lazy',
        },
      );

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
    } catch (error) {
      this.logger.error(
        `Agent execution failed for ${input.agentUniversalIdentifier}`,
        error instanceof Error ? error.stack : error,
      );

      return {
        result: null,
        error: 'Agent execution failed.',
        success: false,
      };
    }
  }
}
