import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { buildActorMetadataFromAuthContext } from 'src/engine/core-modules/actor/utils/build-actor-metadata-from-auth-context.util';
import { buildCreatedByFromApplication } from 'src/engine/core-modules/actor/utils/build-created-by-from-application.util';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { ApiKeyService } from 'src/engine/core-modules/api-key/services/api-key.service';
import { fromApiKeyEntityToFlat } from 'src/engine/core-modules/api-key/utils/from-api-key-entity-to-flat.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type ApplicationWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildApiKeyAuthContext } from 'src/engine/core-modules/auth/utils/build-api-key-auth-context.util';
import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { type AgentRunCallerContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-context.type';
import { type AgentRunCallerRef } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-ref.schema';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { type AgentRunRoleIds } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-role-ids.type';
import { buildAgentRolePermissionConfig } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-role-permission-config.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { resolveApplicationRoleId } from 'src/engine/permissions/principal/utils/resolve-application-role-id.util';

@Injectable()
export class AgentRunCallerContextService {
  constructor(
    private readonly agentActorContextService: AgentActorContextService,
    private readonly apiKeyService: ApiKeyService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
  ) {}

  async buildExecutionContext({
    workspace,
    callerRef,
    requestUserWorkspaceId,
    application,
    callerApplication,
    agent,
  }: {
    workspace: FlatWorkspace;
    callerRef: AgentRunCallerRef;
    requestUserWorkspaceId: string | null;
    // the run never exceeds its role, and acts as it when the caller names no one
    application: FlatApplication | undefined;
    // who the turns are recorded as sent by when the run acts as no member
    callerApplication: FlatApplication | undefined;
    agent?: { roleId: string | undefined };
  }): Promise<AgentRunExecutionContext> {
    const { authContext, actorContext, callerRoleIds } =
      await this.buildCallerContext({
        workspace,
        callerRef,
        applicationAuthContext: isDefined(application)
          ? buildApplicationAuthContext({ workspace, application })
          : undefined,
      });
    const agentRunRoleIds: AgentRunRoleIds = {
      ...callerRoleIds,
      ...resolveApplicationRoleId({
        application,
        isMissingApplicationRoleTolerated: true,
      }),
    };
    const memberAuthContext = isUserAuthContext(authContext)
      ? authContext
      : null;

    return {
      authContext,
      actorContext,
      turnCreatedBy:
        actorContext ??
        (isDefined(callerApplication)
          ? buildCreatedByFromApplication({ application: callerApplication })
          : buildActorMetadataFromAuthContext(authContext)),
      userWorkspaceId:
        memberAuthContext?.userWorkspaceId ?? requestUserWorkspaceId,
      rolePermissionConfig: isDefined(agent)
        ? buildAgentRolePermissionConfig({
            agentRoleId: agent.roleId,
            agentRunRoleIds,
          })
        : { intersectionOf: agentRunRoleIds },
      agentRunRoleIds,
      conversationActor: isDefined(memberAuthContext)
        ? {
            type: 'user',
            workspaceMemberId: memberAuthContext.workspaceMemberId,
          }
        : isDefined(application)
          ? { type: 'application', applicationId: application.id }
          : undefined,
      usageOperationType: UsageOperationType.AI_WORKFLOW_TOKEN,
    };
  }

  // the API key is looked up again, so a run continued after its revocation stops
  private async buildCallerContext({
    workspace,
    callerRef,
    applicationAuthContext,
  }: {
    workspace: FlatWorkspace;
    callerRef: AgentRunCallerRef;
    applicationAuthContext?: ApplicationWorkspaceAuthContext;
  }): Promise<AgentRunCallerContext> {
    if (isDefined(callerRef.callerWorkspaceMemberId)) {
      const { authContext, actorContext, roleId } =
        await this.agentActorContextService.buildRunAsWorkspaceMemberContext({
          workspaceMemberId: callerRef.callerWorkspaceMemberId,
          workspaceId: workspace.id,
          viaApplication: applicationAuthContext?.application,
        });

      return {
        authContext,
        actorContext,
        callerRoleIds: { userWorkspaceRoleId: roleId },
      };
    }

    if (isDefined(callerRef.callerApiKeyId)) {
      const apiKey = await this.apiKeyService.validateApiKey(
        callerRef.callerApiKeyId,
        workspace.id,
      );

      return {
        authContext: buildApiKeyAuthContext({
          workspace,
          apiKey: fromApiKeyEntityToFlat(apiKey),
        }),
        callerRoleIds: {
          apiKeyRoleId: await this.apiKeyRoleService.getRoleIdForApiKeyId(
            apiKey.id,
            workspace.id,
          ),
        },
      };
    }

    if (!isDefined(applicationAuthContext)) {
      throw new AiException(
        'The call has no application to act as',
        AiExceptionCode.RUN_AGENT_NOT_ALLOWED,
      );
    }

    return { authContext: applicationAuthContext };
  }
}
