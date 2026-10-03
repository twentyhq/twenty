import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  type RunAgentMessage,
  type RunAgentResult,
} from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { type RunAsWorkspaceMemberContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/run-as-workspace-member-context.type';
import { addContextToLastRunAgentMessage } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/add-context-to-last-run-agent-message.util';
import { buildAgentRunThreadId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-thread-id.util';
import { AGENT_RUN_BASE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-run-base-system-prompt.const';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AgentConversationReaderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-reader.service';
import { type AgentConversationActor } from 'src/engine/metadata-modules/ai/ai-history/types/agent-conversation-actor.type';
import { withDedicatedAiTrace } from 'src/engine/metadata-modules/ai/ai-models/utils/with-dedicated-ai-trace.util';
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
  runAsWorkspaceMemberId?: string;
  threadKey?: string | null;
  threadTitle?: string | null;
  context?: string | null;
};

@Injectable()
export class AgentRunService {
  private readonly logger = new Logger(AgentRunService.name);

  constructor(
    private readonly agentActorContextService: AgentActorContextService,
    private readonly agentAsyncExecutorService: AgentAsyncExecutorService,
    private readonly agentRunConversationService: AgentRunConversationService,
    private readonly applicationLookupService: ApplicationLookupService,
    private readonly conversationReaderService: AgentConversationReaderService,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
  ) {}

  async run({
    workspace,
    requestUserWorkspaceId,
    requestWorkspaceMemberId,
    callerApplication,
    input,
  }: {
    workspace: FlatWorkspace;
    requestUserWorkspaceId: string | null;
    requestWorkspaceMemberId: string | null;
    callerApplication?: FlatApplication;
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

    const threadKey = isNonEmptyString(input.threadKey)
      ? input.threadKey
      : null;

    if (isDefined(threadKey)) {
      this.assertCanContinueConversation({ callerApplication, messages });
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

    if (
      isDefined(callerApplication) &&
      agent.applicationId !== callerApplication.id
    ) {
      throw new AiException(
        `Agent ${input.agentUniversalIdentifier} belongs to another application`,
        AiExceptionCode.RUN_AGENT_NOT_ALLOWED,
      );
    }

    const application = await this.applicationLookupService.findById({
      id: agent.applicationId,
      workspaceId: workspace.id,
    });

    if (!application) {
      throw new NotFoundException(
        `Application ${agent.applicationId} not found for agent ${input.agentUniversalIdentifier}`,
      );
    }

    const runAsContext = await this.resolveRunAsContext({
      runAsWorkspaceMemberId: input.runAsWorkspaceMemberId,
      callerApplication,
      requestUserWorkspaceId,
      requestWorkspaceMemberId,
      workspaceId: workspace.id,
      application,
    });

    const authContext: WorkspaceAuthContext = runAsContext?.authContext ?? {
      type: 'application',
      workspace,
      application,
    };

    const actor: AgentConversationActor = isDefined(runAsContext)
      ? {
          type: 'user',
          userWorkspaceId: runAsContext.authContext.userWorkspaceId,
        }
      : { type: 'application', applicationId: application.id };

    const threadId = isDefined(threadKey)
      ? buildAgentRunThreadId({
          applicationId: application.id,
          agentId: agent.id,
          threadKey,
        })
      : null;

    const executionMessages = isNonEmptyString(input.context)
      ? addContextToLastRunAgentMessage({ messages, context: input.context })
      : messages;

    const runTurn = async (): Promise<RunAgentResult> => {
      const priorMessages = isDefined(threadId)
        ? await this.conversationReaderService.loadMessages({
            workspaceId: workspace.id,
            threadId,
            actor,
          })
        : [];

      const startedAt = new Date();

      const executionResult = await withDedicatedAiTrace(() =>
        this.agentAsyncExecutorService.executeAgent({
          agent,
          messages: executionMessages,
          priorMessages,
          baseSystemPrompt: AGENT_RUN_BASE_SYSTEM_PROMPT,
          actorContext: runAsContext?.actorContext,
          authContext,
          workspaceId: workspace.id,
          userWorkspaceId:
            runAsContext?.authContext.userWorkspaceId ?? requestUserWorkspaceId,
          runAsRoleId: runAsContext?.roleId,
          operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
          toolLoadingStrategy: 'lazy',
        }),
      );

      if (executionResult.hasNoMoreAvailableCredits) {
        return {
          result: null,
          error: 'Agent stopped: no more available credits.',
          success: false,
          threadId,
        };
      }

      if (isDefined(threadId)) {
        await this.agentRunConversationService
          .recordTurn({
            workspaceId: workspace.id,
            threadId,
            title: isNonEmptyString(input.threadTitle)
              ? input.threadTitle
              : agent.label,
            agentId: agent.id,
            applicationId: application.id,
            actor,
            messages,
            startedAt,
            execution: executionResult,
          })
          .catch((error: unknown) =>
            this.logger.error(
              `Failed to record the turn of ${input.agentUniversalIdentifier} in thread ${threadId}`,
              error instanceof Error ? error.stack : error,
            ),
          );
      }

      return {
        result: executionResult.result,
        error: null,
        success: true,
        threadId,
      };
    };

    try {
      return isDefined(threadId)
        ? await this.agentRunConversationService.withThreadLock({
            workspaceId: workspace.id,
            threadId,
            work: runTurn,
          })
        : await runTurn();
    } catch (error) {
      if (
        error instanceof AiException &&
        error.code === AiExceptionCode.INVALID_AGENT_INPUT
      ) {
        throw error;
      }

      this.logger.error(
        `Agent execution failed for ${input.agentUniversalIdentifier}`,
        error instanceof Error ? error.stack : error,
      );

      return {
        result: null,
        error: 'Agent execution failed.',
        success: false,
        threadId,
      };
    }
  }

  private assertCanContinueConversation({
    callerApplication,
    messages,
  }: {
    callerApplication?: FlatApplication;
    messages: RunAgentMessage[];
  }): void {
    if (!isDefined(callerApplication)) {
      throw new AiException(
        'Continuing a conversation requires an application access token',
        AiExceptionCode.RUN_AGENT_NOT_ALLOWED,
      );
    }

    if (messages.some((message) => message.role !== 'user')) {
      throw new AiException(
        'A conversation already holds its replies, so only user messages can be sent to it',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }
  }

  private async resolveRunAsContext({
    runAsWorkspaceMemberId,
    callerApplication,
    requestUserWorkspaceId,
    requestWorkspaceMemberId,
    workspaceId,
    application,
  }: {
    runAsWorkspaceMemberId?: string;
    callerApplication?: FlatApplication;
    requestUserWorkspaceId: string | null;
    requestWorkspaceMemberId: string | null;
    workspaceId: string;
    application: FlatApplication;
  }): Promise<RunAsWorkspaceMemberContext | undefined> {
    if (!isDefined(runAsWorkspaceMemberId)) {
      return undefined;
    }

    if (!isDefined(callerApplication)) {
      throw new AiException(
        'Running an agent as a workspace member requires an application access token',
        AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_ALLOWED,
      );
    }

    if (
      isDefined(requestUserWorkspaceId) &&
      requestWorkspaceMemberId !== runAsWorkspaceMemberId
    ) {
      throw new AiException(
        'An application token issued for a user can only run an agent as that user',
        AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_ALLOWED,
      );
    }

    return this.agentActorContextService.buildRunAsWorkspaceMemberContext({
      workspaceMemberId: runAsWorkspaceMemberId,
      workspaceId,
      viaApplication: application,
    });
  }
}
