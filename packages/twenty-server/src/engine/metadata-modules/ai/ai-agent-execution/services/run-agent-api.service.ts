import {
  Injectable,
  Logger,
  NotFoundException,
  type OnModuleInit,
} from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';
import {
  type AgentRunState,
  type RunAgentMessage,
  type RunAgentResult,
  type RunAgentThread,
} from 'twenty-shared/application';
import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildActorMetadataFromAuthContext } from 'src/engine/core-modules/actor/utils/build-actor-metadata-from-auth-context.util';
import { buildCreatedByFromApplication } from 'src/engine/core-modules/actor/utils/build-created-by-from-application.util';
import { ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunCallerInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-input.type';
import { type AgentRunCallerHandler } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-handler.type';
import { type AgentRunCallerWaitingState } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-waiting-state.type';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { type RunAsWorkspaceMemberContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/run-as-workspace-member-context.type';
import { buildAgentRolePermissionConfig } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-role-permission-config.util';
import { buildAgentRunThreadId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-thread-id.util';
import { resolveRunAgentMessagesOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-run-agent-messages-or-throw.util';
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
  input?: RunAgentMessage[] | null;
  prompt?: string | null;
  messages?: RunAgentMessage[] | null;
  additionalInstructions?: string | null;
  thread?: RunAgentThread | null;
  runAsWorkspaceMemberId?: string;
};

type AgentApiRunCaller = Extract<AgentRunCaller, { type: 'AGENT_API_RUN' }>;

// Runs an agent for the runAgent API. A run that waits goes on later with the API call as its
// caller, and its reply lands in its conversation
@Injectable()
export class RunAgentApiService
  implements AgentRunCallerHandler<AgentApiRunCaller>, OnModuleInit
{
  private readonly logger = new Logger(RunAgentApiService.name);

  constructor(
    private readonly agentActorContextService: AgentActorContextService,
    private readonly agentRunnerService: AgentRunnerService,
    private readonly agentRunService: AgentRunService,
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
    private readonly applicationLookupService: ApplicationLookupService,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
  ) {}

  onModuleInit(): void {
    this.callerHandlerRegistry.register('AGENT_API_RUN', this);
  }

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
    const messages = resolveRunAgentMessagesOrThrow({
      input: input.input,
      prompt: input.prompt,
      messages: input.messages,
    });

    if (isDefined(input.thread) && !isNonEmptyString(input.thread.key.trim())) {
      throw new AiException(
        'thread.key must not be empty',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    const thread = input.thread ?? null;

    if (isDefined(thread) && !isDefined(callerApplication)) {
      throw new AiException(
        'Continuing a conversation requires an application access token',
        AiExceptionCode.RUN_AGENT_NOT_ALLOWED,
      );
    }

    if (
      isDefined(thread) &&
      messages.some((message) => message.role !== 'user')
    ) {
      throw new AiException(
        'A conversation already holds its replies, so only user messages can be sent to it',
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

    const threadId = isDefined(thread)
      ? buildAgentRunThreadId({
          applicationId: application.id,
          agentId: agent.id,
          threadKey: thread.key,
        })
      : randomUUID();
    const runId = randomUUID();

    const caller: AgentApiRunCaller = {
      type: 'AGENT_API_RUN',
      ref: {
        agentId: agent.id,
        runAsWorkspaceMemberId: input.runAsWorkspaceMemberId ?? null,
        requestUserWorkspaceId,
        createdBy:
          runAsContext?.actorContext ??
          this.buildRunCreator({ callerApplication, application }),
      },
    };

    try {
      const { outcome } = await this.agentRunnerService.run({
        runId,
        workspaceId: workspace.id,
        conversation: { threadId, isCreated: !isDefined(thread) },
        caller,
        spec: {
          agentId: agent.id,
          title: isNonEmptyString(thread?.title) ? thread.title : agent.label,
          baseSystemPrompt: AGENT_RUN_BASE_SYSTEM_PROMPT,
          // kept with the run rather than in its messages, so a run that waits still has them when it goes on
          instructions: input.additionalInstructions ?? null,
          // the call returns before anyone could answer, so the run can wait but not ask
          capabilities: {
            canAskHumans: false,
          },
          toolLoadingStrategy: 'lazy',
        },
        agent,
        prompt: {
          messages,
          // a member calling without runAs still sent the input, while an app's call has no member behind it
          senderUserWorkspaceId:
            runAsContext?.authContext.userWorkspaceId ??
            (isDefined(callerApplication) ? null : requestUserWorkspaceId),
          senderApplicationId: callerApplication?.id ?? null,
        },
        executionContext: await this.buildExecutionContext({
          workspaceId: workspace.id,
          caller,
        }),
      });

      return {
        runId,
        threadId,
        status: outcome.status,
        result: outcome.status === 'COMPLETED' ? outcome.result : null,
        error: outcome.status === 'FAILED' ? outcome.error : null,
        success: outcome.status !== 'FAILED',
      };
    } catch (error) {
      if (
        error instanceof AiException &&
        (error.code === AiExceptionCode.INVALID_AGENT_INPUT ||
          error.code === AiExceptionCode.THREAD_AWAITING_ANSWER)
      ) {
        throw error;
      }

      this.logger.error(
        `Agent execution failed for ${input.agentUniversalIdentifier}`,
        error instanceof Error ? error.stack : error,
      );

      return {
        runId,
        threadId,
        status: 'FAILED',
        result: null,
        error: 'Agent execution failed.',
        success: false,
      };
    }
  }

  // Only runs started through this API are read, and an app reads the runs of its own agents only,
  // as it runs only those
  async findRun({
    workspaceId,
    runId,
    callerApplication,
  }: {
    workspaceId: string;
    runId: string;
    callerApplication?: FlatApplication;
  }): Promise<AgentRunState> {
    const run = await this.agentRunService.findOne({ workspaceId, id: runId });
    const notFoundError = new NotFoundException(`Agent run ${runId} not found`);

    if (!isDefined(run) || run.caller.type !== 'AGENT_API_RUN') {
      throw notFoundError;
    }

    if (isDefined(callerApplication)) {
      const agent = await this.agentRepository.findOne(workspaceId, {
        where: { id: run.caller.ref.agentId },
        select: ['id', 'applicationId'],
      });

      if (agent?.applicationId !== callerApplication.id) {
        throw notFoundError;
      }
    }

    return {
      id: run.id,
      threadId: run.threadId,
      status: run.status,
      result:
        isDefined(run.outcome) && 'result' in run.outcome
          ? run.outcome.result
          : null,
      error:
        isDefined(run.outcome) && 'error' in run.outcome
          ? run.outcome.error
          : null,
    };
  }

  // The member a run acts as is looked up again, so a waiting run goes on with their current role
  async buildExecutionContext({
    workspaceId,
    caller: { ref },
  }: AgentRunCallerInput<AgentApiRunCaller>): Promise<AgentRunExecutionContext> {
    const agent = await this.agentRepository.findOne(workspaceId, {
      where: { id: ref.agentId },
    });
    const agentContext = isDefined(agent)
      ? await this.agentActorContextService.buildApplicationAgentContext({
          workspaceId,
          agent,
        })
      : null;

    if (!isDefined(agentContext)) {
      throw new AiException(
        `Agent ${ref.agentId} or its application no longer exists`,
        AiExceptionCode.AGENT_NOT_FOUND,
      );
    }

    const runAsContext = isDefined(ref.runAsWorkspaceMemberId)
      ? await this.agentActorContextService.buildRunAsWorkspaceMemberContext({
          workspaceMemberId: ref.runAsWorkspaceMemberId,
          workspaceId,
          viaApplication: agentContext.application,
        })
      : undefined;

    return {
      authContext: runAsContext?.authContext ?? agentContext.authContext,
      actorContext: runAsContext?.actorContext,
      turnCreatedBy: ref.createdBy,
      userWorkspaceId:
        runAsContext?.authContext.userWorkspaceId ?? ref.requestUserWorkspaceId,
      rolePermissionConfig: buildAgentRolePermissionConfig({
        agentRoleId: agentContext.agentRoleId,
        runAsRoleId: runAsContext?.roleId,
      }),
      runAsRoleId: runAsContext?.roleId,
      conversationActor: isDefined(runAsContext)
        ? {
            type: 'user',
            userWorkspaceId: runAsContext.authContext.userWorkspaceId,
          }
        : { type: 'application', applicationId: agentContext.application.id },
      usageOperationType: UsageOperationType.AI_WORKFLOW_TOKEN,
    };
  }

  async getWaitingState({
    workspaceId,
    caller,
  }: AgentRunCallerInput<AgentApiRunCaller>): Promise<AgentRunCallerWaitingState> {
    const agent = await this.agentRepository.findOne(workspaceId, {
      where: { id: caller.ref.agentId },
      select: ['id'],
    });

    if (!isDefined(agent)) {
      return 'GONE';
    }

    if (!isDefined(caller.ref.runAsWorkspaceMemberId)) {
      return 'WAITING';
    }

    // a run acting as a member who left can never continue, so it must release its thread
    try {
      await this.agentActorContextService.buildRunAsWorkspaceMemberContext({
        workspaceMemberId: caller.ref.runAsWorkspaceMemberId,
        workspaceId,
      });

      return 'WAITING';
    } catch (error) {
      if (
        error instanceof AiException &&
        error.code === AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_FOUND
      ) {
        return 'GONE';
      }

      throw error;
    }
  }

  private buildRunCreator({
    callerApplication,
    application,
  }: {
    callerApplication?: FlatApplication;
    application: FlatApplication;
  }): ActorMetadata {
    if (isDefined(callerApplication)) {
      return buildCreatedByFromApplication({ application: callerApplication });
    }

    const requestAuthContext = workspaceAuthContextStorage.getStore();

    return isDefined(requestAuthContext)
      ? buildActorMetadataFromAuthContext(requestAuthContext)
      : buildCreatedByFromApplication({ application });
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
