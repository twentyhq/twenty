import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  type RunAgentMessage,
  type RunAgentResult,
} from 'twenty-shared/application';
import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AGENT_RUN_BASE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-run-base-system-prompt.const';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { withDedicatedAiTrace } from 'src/engine/metadata-modules/ai/ai-models/utils/with-dedicated-ai-trace.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type RunAgentServiceInput = {
  agentUniversalIdentifier: string;
  prompt?: string | null;
  messages?: RunAgentMessage[] | null;
  runAsWorkspaceMemberId?: string;
  runAsRoleId?: string;
};

// The auth context and actor are the member's when running as one (with the
// application kept as viaApplication), or absent when running as a bare role,
// which keeps the default application context. roleIds is the intersection the
// run is capped to: [member], [role], or [member, role].
type ResolvedRunAsContext = {
  actorContext?: ActorMetadata;
  authContext?: WorkspaceAuthContext;
  roleIds: string[];
};

@Injectable()
export class AgentRunService {
  private readonly logger = new Logger(AgentRunService.name);

  constructor(
    private readonly agentActorContextService: AgentActorContextService,
    private readonly agentAsyncExecutorService: AgentAsyncExecutorService,
    private readonly applicationService: ApplicationService,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
    @InjectWorkspaceScopedRepository(RoleEntity)
    private readonly roleRepository: WorkspaceScopedRepository<RoleEntity>,
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

    const application = await this.applicationService.findById(
      agent.applicationId,
    );

    if (!application) {
      throw new NotFoundException(
        `Application ${agent.applicationId} not found for agent ${input.agentUniversalIdentifier}`,
      );
    }

    const runAsContext = await this.resolveRunAsContext({
      runAsWorkspaceMemberId: input.runAsWorkspaceMemberId,
      runAsRoleId: input.runAsRoleId,
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

    try {
      const executionResult = await withDedicatedAiTrace(() =>
        this.agentAsyncExecutorService.executeAgent({
          agent,
          messages,
          baseSystemPrompt: AGENT_RUN_BASE_SYSTEM_PROMPT,
          actorContext: runAsContext?.actorContext,
          authContext,
          workspaceId: workspace.id,
          userWorkspaceId:
            runAsContext?.authContext?.userWorkspaceId ?? requestUserWorkspaceId,
          runAsRoleIds: runAsContext?.roleIds,
          operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
          toolLoadingStrategy: 'lazy',
        }),
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

  private async resolveRunAsContext({
    runAsWorkspaceMemberId,
    runAsRoleId,
    callerApplication,
    requestUserWorkspaceId,
    requestWorkspaceMemberId,
    workspaceId,
    application,
  }: {
    runAsWorkspaceMemberId?: string;
    runAsRoleId?: string;
    callerApplication?: FlatApplication;
    requestUserWorkspaceId: string | null;
    requestWorkspaceMemberId: string | null;
    workspaceId: string;
    application: FlatApplication;
  }): Promise<ResolvedRunAsContext | undefined> {
    if (!isDefined(runAsWorkspaceMemberId) && !isDefined(runAsRoleId)) {
      return undefined;
    }

    // Both forms of run-as mirror the same trust: only an application, acting as
    // itself, may narrow a run to a member or a role. Which member or role is
    // safe to assume is the calling application's responsibility, as it already
    // is for runAsWorkspaceMemberId.
    if (!isDefined(callerApplication)) {
      throw new AiException(
        'Running an agent as a workspace member or role requires an application access token',
        AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_ALLOWED,
      );
    }

    if (
      isDefined(runAsWorkspaceMemberId) &&
      isDefined(requestUserWorkspaceId) &&
      requestWorkspaceMemberId !== runAsWorkspaceMemberId
    ) {
      throw new AiException(
        'An application token issued for a user can only run an agent as that user',
        AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_ALLOWED,
      );
    }

    const runAsRoleIdOrUndefined = isDefined(runAsRoleId)
      ? await this.resolveRunAsRoleIdOrThrow({ roleId: runAsRoleId, workspaceId })
      : undefined;

    if (isDefined(runAsWorkspaceMemberId)) {
      const memberContext =
        await this.agentActorContextService.buildRunAsWorkspaceMemberContext({
          workspaceMemberId: runAsWorkspaceMemberId,
          workspaceId,
          viaApplication: application,
        });

      return {
        actorContext: memberContext.actorContext,
        authContext: memberContext.authContext,
        roleIds: isDefined(runAsRoleIdOrUndefined)
          ? [memberContext.roleId, runAsRoleIdOrUndefined]
          : [memberContext.roleId],
      };
    }

    // Role-only: no member behind the run, so the default application auth
    // context stands and only the permission ceiling narrows.
    return { roleIds: [runAsRoleIdOrUndefined as string] };
  }

  private async resolveRunAsRoleIdOrThrow({
    roleId,
    workspaceId,
  }: {
    roleId: string;
    workspaceId: string;
  }): Promise<string> {
    const role = await this.roleRepository.findOne(workspaceId, {
      where: { id: roleId },
    });

    if (!isDefined(role)) {
      throw new AiException(
        `Role ${roleId} not found`,
        AiExceptionCode.ROLE_NOT_FOUND,
      );
    }

    if (!role.canBeAssignedToAgents) {
      throw new AiException(
        `Role "${role.label}" cannot be assigned to agents`,
        AiExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS,
      );
    }

    return role.id;
  }
}
