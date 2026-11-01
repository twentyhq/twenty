import {
  Injectable,
  Logger,
  NotFoundException,
  type OnModuleInit,
} from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';
import {
  type RunAgentMessage,
  type RunAgentResult,
  type RunAgentThread,
} from 'twenty-shared/application';
import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { agentResponseFormatSchema } from 'twenty-shared/workflow';
import { z } from 'zod';

import { ApiKeyException } from 'src/engine/core-modules/api-key/exceptions/api-key.exception';
import { ApiKeyService } from 'src/engine/core-modules/api-key/services/api-key.service';
import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { type ApplicationCallerOperation } from 'src/engine/core-modules/application/types/application-caller-operation.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AgentRunCallerContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-context.service';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { assertAgentResponseFormatHasOutputFieldsOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/assert-agent-response-format-has-output-fields-or-throw.util';
import { RUN_AGENT_MAX_WAIT_MS } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/run-agent-max-wait-ms.const';
import { AgentRunSettlementService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-settlement.service';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { type AgentRunCallerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-outcome.type';
import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { agentRunCallerRefSchema } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-ref.schema';
import { type AgentRunCallerInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-input.type';
import { type AgentRunCallerHandler } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-handler.type';
import { type OwnerWaitingState } from 'src/engine/core-modules/pending-wake-up/types/owner-waiting-state.type';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { type RunAsWorkspaceMemberContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/run-as-workspace-member-context.type';
import { type SettledAgentRun } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/settled-agent-run.type';
import { buildAgentRunThreadId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-thread-id.util';
import { parseAgentInputOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/parse-agent-input-or-throw.util';
import { resolveAgentRunCallerRefOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-agent-run-caller-ref-or-throw.util';
import { resolveRunAgentMessagesOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-run-agent-messages-or-throw.util';
import { AGENT_RUN_BASE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-run-base-system-prompt.const';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { resolveEffectiveAgent } from 'src/engine/metadata-modules/flat-agent/utils/resolve-effective-agent.util';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type CallingApplication = NonNullable<
  ApplicationCallerOperation['callingApplication']
>;

type RunAgentServiceInput = {
  agentUniversalIdentifier: string;
  input?: RunAgentMessage[] | null;
  prompt?: string | null;
  messages?: RunAgentMessage[] | null;
  additionalInstructions?: string | null;
  responseFormat?: unknown;
  thread?: RunAgentThread | null;
  runAsWorkspaceMemberId?: string;
  waitForCompletion?: boolean | null;
};

const agentApiRunCallerRefSchema = agentRunCallerRefSchema.extend({
  // what a call waiting on the run listens to; absent on runs suspended before calls could wait
  runId: z.string().optional(),
  agentId: z.string(),
  runAsWorkspaceMemberId: z.string().nullable(),
  requestUserWorkspaceId: z.string().nullable(),
  // the request's own actor cannot be read back once it is over
  createdBy: z.custom<ActorMetadata>(isPlainObject),
});

type AgentApiRunCallerRef = Omit<
  z.infer<typeof agentApiRunCallerRefSchema>,
  'createdBy'
>;

// Runs an agent for the runAgent API. A run that waits goes on later with the API call as its
// caller, and its reply lands in its conversation
@Injectable()
export class AgentRunService implements AgentRunCallerHandler, OnModuleInit {
  private readonly logger = new Logger(AgentRunService.name);

  constructor(
    private readonly agentActorContextService: AgentActorContextService,
    private readonly agentRunnerService: AgentRunnerService,
    private readonly agentChatThreadService: AgentChatThreadService,
    private readonly agentRunSettlementService: AgentRunSettlementService,
    private readonly agentRunSuspensionService: AgentRunSuspensionService,
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
    private readonly agentRunCallerContextService: AgentRunCallerContextService,
    private readonly apiKeyService: ApiKeyService,
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
    callerApiKey,
    input,
  }: {
    workspace: FlatWorkspace;
    requestUserWorkspaceId: string | null;
    requestWorkspaceMemberId: string | null;
    callerApplication?: FlatApplication;
    callerApiKey?: FlatApiKey;
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

    const responseFormat = parseAgentInputOrThrow({
      schema: agentResponseFormatSchema.nullish(),
      input: input.responseFormat,
      label: 'response format',
    });

    const agent = await this.findCallerAgentOrThrow({
      workspace,
      callerApplication,
      agentUniversalIdentifier: input.agentUniversalIdentifier,
      operation: 'trigger',
    });

    if (!agent.isActive) {
      throw new AiException(
        `Agent ${input.agentUniversalIdentifier} is archived`,
        AiExceptionCode.AGENT_IS_INACTIVE,
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
      ? this.buildCallerThreadIdOrThrow({
          callerApplication,
          agentId: agent.id,
          threadKey: thread.key,
        })
      : randomUUID();

    const callerRef: AgentApiRunCallerRef = {
      agentId: agent.id,
      runAsWorkspaceMemberId: input.runAsWorkspaceMemberId ?? null,
      ...(isDefined(runAsContext)
        ? {}
        : resolveAgentRunCallerRefOrThrow({
            callerApplication,
            callerApiKey,
            requestUserWorkspaceId,
            requestWorkspaceMemberId,
          })),
      requestUserWorkspaceId,
    };

    const executionContext = await this.buildRunExecutionContext({
      workspaceId: workspace.id,
      ref: callerRef,
      callerApplication,
    });

    const memberUserWorkspaceId = isUserAuthContext(
      executionContext.authContext,
    )
      ? executionContext.authContext.userWorkspaceId
      : null;

    const isContinuingConversation = isDefined(thread);

    // a conversation waiting on an earlier run refuses the call, rather than a run that fails later
    if (isContinuingConversation) {
      await this.agentRunSuspensionService.assertConversationNotSuspended({
        workspaceId: workspace.id,
        threadId,
      });
    }

    assertAgentResponseFormatHasOutputFieldsOrThrow(
      responseFormat ?? agent.responseFormat,
    );

    const title = isNonEmptyString(thread?.title) ? thread.title : agent.label;

    if (
      isContinuingConversation &&
      isUserAuthContext(executionContext.authContext)
    ) {
      await this.claimThreadForMember({
        threadId,
        authContext: executionContext.authContext,
        title,
      });
    }

    const runId = randomUUID();

    await this.agentRunnerService.start({
      workspaceId: workspace.id,
      conversation: { threadId, isCreated: !isContinuingConversation },
      caller: {
        type: 'AGENT_API_RUN',
        ref: {
          ...callerRef,
          runId,
          createdBy: executionContext.turnCreatedBy,
        },
      },
      spec: {
        agentId: agent.id,
        title,
        baseSystemPrompt: AGENT_RUN_BASE_SYSTEM_PROMPT,
        // kept with the run rather than in its messages, so a run that waits still has them when it goes on
        instructions: input.additionalInstructions ?? null,
        ...(isDefined(responseFormat) ? { responseFormat } : {}),
        // the call returns before anyone could answer, so the run can wait but not ask
        capabilities: {
          canAskHumans: false,
        },
        toolLoadingStrategy: 'lazy',
      },
      prompt: {
        messages,
        senderUserWorkspaceId: memberUserWorkspaceId,
        senderApplicationId: callerApplication?.id ?? null,
        turnId: runId,
      },
    });

    if (input.waitForCompletion === false) {
      return this.buildRunAgentResult({ threadId, runId, status: 'RUNNING' });
    }

    const settledRun = await this.agentRunSettlementService.waitFor({
      runId,
      timeoutMs: RUN_AGENT_MAX_WAIT_MS,
    });

    return this.buildRunAgentResult({
      threadId,
      runId,
      ...(settledRun ?? { status: 'RUNNING' }),
    });
  }

  async resolveConversationThreadIdOrThrow({
    workspace,
    callerApplication,
    agentUniversalIdentifier,
    threadKey,
  }: {
    workspace: Pick<FlatWorkspace, 'id' | 'workspaceCustomApplicationId'>;
    callerApplication: CallingApplication;
    agentUniversalIdentifier: string;
    threadKey: string;
  }): Promise<string> {
    const agent = await this.findCallerAgentOrThrow({
      workspace,
      callerApplication,
      agentUniversalIdentifier,
      operation: 'read',
    });

    return this.buildCallerThreadIdOrThrow({
      callerApplication,
      agentId: agent.id,
      threadKey,
    });
  }

  private async findCallerAgentOrThrow({
    workspace,
    callerApplication,
    agentUniversalIdentifier,
    operation,
  }: {
    workspace: Pick<FlatWorkspace, 'id' | 'workspaceCustomApplicationId'>;
    callerApplication: CallingApplication | undefined;
    agentUniversalIdentifier: string;
    operation: 'read' | 'trigger';
  }) {
    const agentRow = await this.agentRepository.findOne(workspace.id, {
      where: { universalIdentifier: agentUniversalIdentifier },
    });

    if (!isDefined(agentRow)) {
      throw new AiException(
        `Agent ${agentUniversalIdentifier} not found`,
        AiExceptionCode.AGENT_NOT_FOUND,
      );
    }

    const agent = resolveEffectiveAgent(agentRow);

    if (
      !canCallerReachApplication({
        callingApplication: callerApplication,
        applicationId: agent.applicationId,
        operation,
        workspaceCustomApplicationId: workspace.workspaceCustomApplicationId,
      })
    ) {
      throw new AiException(
        `Agent ${agentUniversalIdentifier} belongs to another application`,
        AiExceptionCode.RUN_AGENT_NOT_ALLOWED,
      );
    }

    return agent;
  }

  // keyed by the caller, so an application never reaches another one's conversation with a shared agent
  private buildCallerThreadIdOrThrow({
    callerApplication,
    agentId,
    threadKey,
  }: {
    callerApplication: Pick<FlatApplication, 'id'> | undefined;
    agentId: string;
    threadKey: string;
  }): string {
    if (!isDefined(callerApplication)) {
      throw new AiException(
        'Continuing a conversation requires an application access token',
        AiExceptionCode.RUN_AGENT_NOT_ALLOWED,
      );
    }

    return buildAgentRunThreadId({
      applicationId: callerApplication.id,
      agentId,
      threadKey,
    });
  }

  private async claimThreadForMember({
    threadId,
    authContext,
    title,
  }: {
    threadId: string;
    authContext: Pick<
      UserWorkspaceAuthContext,
      'workspace' | 'workspaceMemberId'
    >;
    title: string;
  }): Promise<void> {
    try {
      await this.agentChatThreadService.claimThreadForRun({
        threadId,
        workspaceId: authContext.workspace.id,
        workspaceMemberId: authContext.workspaceMemberId,
        title,
      });
    } catch (error) {
      this.logger.warn(
        `Could not claim thread ${threadId} of workspace ${authContext.workspace.id} for member ${authContext.workspaceMemberId}`,
        error,
      );
    }
  }

  // a call that waits on the run gets how it settled; a run that goes on later lands in its conversation
  async onSuspended({ caller }: AgentRunCallerInput): Promise<void> {
    await this.publishSettledRun({
      caller,
      settledRun: { status: 'SUSPENDED' },
    });
  }

  async onOutcome({
    caller,
    outcome,
  }: AgentRunCallerInput & { outcome: AgentRunCallerOutcome }): Promise<void> {
    await this.publishSettledRun({
      caller,
      settledRun:
        outcome.status === 'COMPLETED'
          ? { status: 'COMPLETED', result: outcome.result }
          : { status: 'FAILED', error: outcome.error },
    });
  }

  // the request that waits on the run is still there when its agent or key went away meanwhile
  async onCallerGone({
    caller,
    outcome,
  }: AgentRunCallerInput & { outcome: AgentRunCallerOutcome }): Promise<void> {
    await this.publishSettledRun({
      caller,
      settledRun: {
        status: 'FAILED',
        error:
          outcome.status === 'FAILED'
            ? outcome.error
            : 'The agent or the key that started this run is gone',
      },
    });
  }

  private async publishSettledRun({
    caller,
    settledRun,
  }: {
    caller: AgentRunCaller;
    settledRun: Pick<SettledAgentRun, 'status'> & Partial<SettledAgentRun>;
  }): Promise<void> {
    const { runId } = agentApiRunCallerRefSchema.parse(caller.ref);

    if (!isDefined(runId)) {
      return;
    }

    await this.agentRunSettlementService.publish({
      runId,
      settledRun: { result: null, error: null, ...settledRun },
    });
  }

  private buildRunAgentResult({
    threadId,
    runId,
    status,
    result = null,
    error = null,
  }: Pick<RunAgentResult, 'threadId' | 'runId' | 'status'> &
    Partial<Pick<RunAgentResult, 'result' | 'error'>>): RunAgentResult {
    return {
      threadId,
      runId,
      status,
      result,
      error,
      success: status !== 'FAILED',
    };
  }

  // The member a run acts as is looked up again, so a waiting run goes on with their current role
  async buildExecutionContext({
    workspaceId,
    caller,
  }: AgentRunCallerInput): Promise<AgentRunExecutionContext> {
    const ref = agentApiRunCallerRefSchema.parse(caller.ref);

    return {
      ...(await this.buildRunExecutionContext({
        workspaceId,
        ref,
        callerApplication: undefined,
      })),
      turnCreatedBy: ref.createdBy,
    };
  }

  private async buildRunExecutionContext({
    workspaceId,
    ref,
    callerApplication,
  }: {
    workspaceId: string;
    ref: AgentApiRunCallerRef;
    callerApplication: FlatApplication | undefined;
  }): Promise<AgentRunExecutionContext> {
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

    return this.agentRunCallerContextService.buildExecutionContext({
      workspace: agentContext.authContext.workspace,
      callerRef: isDefined(ref.runAsWorkspaceMemberId)
        ? { callerWorkspaceMemberId: ref.runAsWorkspaceMemberId }
        : ref,
      requestUserWorkspaceId: ref.requestUserWorkspaceId,
      application: agentContext.application,
      callerApplication,
      agent: { roleId: agentContext.agentRoleId },
    });
  }

  async getWaitingState({
    workspaceId,
    caller,
  }: AgentRunCallerInput): Promise<OwnerWaitingState> {
    const {
      agentId,
      runAsWorkspaceMemberId,
      callerWorkspaceMemberId,
      callerApiKeyId,
    } = agentApiRunCallerRefSchema.parse(caller.ref);
    const agent = await this.agentRepository.findOne(workspaceId, {
      where: { id: agentId },
      select: ['id'],
    });

    if (!isDefined(agent)) {
      return 'GONE';
    }

    if (isDefined(callerApiKeyId)) {
      try {
        await this.apiKeyService.validateApiKey(callerApiKeyId, workspaceId);

        return 'WAITING';
      } catch (error) {
        if (error instanceof ApiKeyException) {
          return 'GONE';
        }

        throw error;
      }
    }

    const workspaceMemberId = runAsWorkspaceMemberId ?? callerWorkspaceMemberId;

    if (!isDefined(workspaceMemberId)) {
      return 'WAITING';
    }

    // a run acting as a member who left can never continue, so it must release its thread
    try {
      await this.agentActorContextService.buildRunAsWorkspaceMemberContext({
        workspaceMemberId,
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
