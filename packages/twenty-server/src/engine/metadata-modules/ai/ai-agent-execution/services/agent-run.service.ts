import {
  Injectable,
  Logger,
  NotFoundException,
  type OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';
import {
  type RunAgentMessage,
  type RunAgentResult,
  type RunAgentThread,
} from 'twenty-shared/application';
import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { buildActorMetadataFromAuthContext } from 'src/engine/core-modules/actor/utils/build-actor-metadata-from-auth-context.util';
import { buildCreatedByFromApplication } from 'src/engine/core-modules/actor/utils/build-created-by-from-application.util';
import { ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunCallerInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-input.type';
import { type AgentRunCallerHandler } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-handler.type';
import { type AgentRunCallerWaitingState } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-waiting-state.type';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { type RunAsWorkspaceMemberContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/run-as-workspace-member-context.type';
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
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

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
export class AgentRunService
  implements AgentRunCallerHandler<AgentApiRunCaller>, OnModuleInit
{
  readonly callerType = 'AGENT_API_RUN';

  private readonly logger = new Logger(AgentRunService.name);

  constructor(
    private readonly agentActorContextService: AgentActorContextService,
    private readonly agentRunnerService: AgentRunnerService,
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
    private readonly applicationLookupService: ApplicationLookupService,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  onModuleInit(): void {
    this.callerHandlerRegistry.register(this);
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

    if (isDefined(thread)) {
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

    const threadId = isDefined(thread)
      ? buildAgentRunThreadId({
          applicationId: application.id,
          agentId: agent.id,
          threadKey: thread.key,
        })
      : randomUUID();

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
            canProposeToolCalls: false,
          },
          toolLoadingStrategy: 'lazy',
        },
        agent,
        prompt: {
          messages,
          senderUserWorkspaceId: this.resolveRunSender({
            runAsContext,
            callerApplication,
            requestUserWorkspaceId,
          }),
          senderApplicationId: callerApplication?.id ?? null,
        },
        executionContext: await this.buildRunExecutionContext({
          workspace,
          application,
          agentId: agent.id,
          runAsContext,
          requestUserWorkspaceId,
        }),
        resolveCreatedBy: async () => caller.ref.createdBy,
      });

      return {
        result: outcome.status === 'COMPLETED' ? outcome.result : null,
        error: outcome.status === 'FAILED' ? outcome.error : null,
        success: outcome.status !== 'FAILED',
        isWaiting: outcome.status === 'SUSPENDED',
        threadId,
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
        result: null,
        error: 'Agent execution failed.',
        success: false,
        isWaiting: false,
        threadId,
      };
    }
  }

  // The member a run acts as is looked up again, so a waiting run goes on with their current role
  async buildExecutionContext({
    workspaceId,
    caller: { ref },
  }: AgentRunCallerInput<AgentApiRunCaller>): Promise<AgentRunExecutionContext> {
    const agent = await this.agentRepository.findOne(workspaceId, {
      where: { id: ref.agentId },
    });
    const application = isDefined(agent)
      ? await this.applicationLookupService.findById({
          id: agent.applicationId,
          workspaceId,
        })
      : null;

    if (!isDefined(agent) || !isDefined(application)) {
      throw new AiException(
        `Agent ${ref.agentId} or its application no longer exists`,
        AiExceptionCode.AGENT_NOT_FOUND,
      );
    }

    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { id: workspaceId },
    });

    return this.buildRunExecutionContext({
      workspace: fromWorkspaceEntityToFlat(workspace),
      application,
      agentId: agent.id,
      runAsContext: isDefined(ref.runAsWorkspaceMemberId)
        ? await this.agentActorContextService.buildRunAsWorkspaceMemberContext({
            workspaceMemberId: ref.runAsWorkspaceMemberId,
            workspaceId,
            viaApplication: application,
          })
        : undefined,
      requestUserWorkspaceId: ref.requestUserWorkspaceId,
    });
  }

  async resolveTurnAuthor({
    caller,
  }: AgentRunCallerInput<AgentApiRunCaller>): Promise<ActorMetadata> {
    return caller.ref.createdBy;
  }

  async getWaitingState({
    workspaceId,
    caller,
  }: AgentRunCallerInput<AgentApiRunCaller>): Promise<AgentRunCallerWaitingState> {
    const agent = await this.agentRepository.findOne(workspaceId, {
      where: { id: caller.ref.agentId },
      select: ['id'],
    });

    return isDefined(agent) ? 'WAITING' : 'GONE';
  }

  private async buildRunExecutionContext({
    workspace,
    application,
    agentId,
    runAsContext,
    requestUserWorkspaceId,
  }: {
    workspace: FlatWorkspace;
    application: FlatApplication;
    agentId: string;
    runAsContext?: RunAsWorkspaceMemberContext;
    requestUserWorkspaceId: string | null;
  }): Promise<AgentRunExecutionContext> {
    if (isDefined(runAsContext)) {
      return {
        authContext: runAsContext.authContext,
        actorContext: runAsContext.actorContext,
        userWorkspaceId: runAsContext.authContext.userWorkspaceId,
        rolePermissionConfig: { intersectionOf: [runAsContext.roleId] },
        runAsRoleId: runAsContext.roleId,
        conversationActor: {
          type: 'user',
          userWorkspaceId: runAsContext.authContext.userWorkspaceId,
        },
      };
    }

    const { flatRoleTargetByAgentIdMaps } =
      await this.workspaceCacheService.getOrRecompute(workspace.id, [
        'flatRoleTargetByAgentIdMaps',
      ]);
    const agentRoleId = flatRoleTargetByAgentIdMaps[agentId]?.roleId;

    return {
      authContext: buildApplicationAuthContext({ workspace, application }),
      userWorkspaceId: requestUserWorkspaceId,
      // without a role the agent reads nothing
      rolePermissionConfig: {
        intersectionOf: isDefined(agentRoleId) ? [agentRoleId] : [],
      },
      conversationActor: { type: 'application', applicationId: application.id },
    };
  }

  // a member calling without runAs still sent the input, while an app's call has no member behind it
  private resolveRunSender({
    runAsContext,
    callerApplication,
    requestUserWorkspaceId,
  }: {
    runAsContext?: RunAsWorkspaceMemberContext;
    callerApplication?: FlatApplication;
    requestUserWorkspaceId: string | null;
  }): string | null {
    if (isDefined(runAsContext)) {
      return runAsContext.authContext.userWorkspaceId;
    }

    if (isDefined(callerApplication)) {
      return null;
    }

    return requestUserWorkspaceId;
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
