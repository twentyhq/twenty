import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApiKeyService } from 'src/engine/core-modules/api-key/services/api-key.service';
import { fromApiKeyEntityToFlat } from 'src/engine/core-modules/api-key/utils/from-api-key-entity-to-flat.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type ApplicationWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildApiKeyAuthContext } from 'src/engine/core-modules/auth/utils/build-api-key-auth-context.util';
import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { type AgentRunCallerContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-context.type';
import { type AgentRunCallerRef } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-ref.schema';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { buildAgentRunAuthContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-auth-context.util';
import { buildAgentRunTurnCreatedBy } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-turn-created-by.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class AgentRunCallerContextService {
  constructor(
    private readonly agentActorContextService: AgentActorContextService,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  async buildExecutionContext({
    workspace,
    callerRef,
    requestUserWorkspaceId,
    agentId,
    application,
    callerApplication,
  }: {
    workspace: FlatWorkspace;
    agentId?: string;
    callerRef: AgentRunCallerRef;
    requestUserWorkspaceId: string | null;
    application: FlatApplication | undefined;
    // differs from application when an application runs an agent of another one
    callerApplication: FlatApplication | undefined;
  }): Promise<AgentRunExecutionContext> {
    const { authContext: callerAuthContext, actorContext } =
      await this.buildCallerContextOrThrow({
        workspace,
        callerRef,
        applicationAuthContext: isDefined(application)
          ? buildApplicationAuthContext({ workspace, application })
          : undefined,
      });
    const authContext = buildAgentRunAuthContext({
      authContext: callerAuthContext,
      agentId,
      application,
    });

    return {
      authContext,
      actorContext,
      turnCreatedBy: buildAgentRunTurnCreatedBy({
        actorContext,
        callerApplication,
        authContext,
      }),
      userWorkspaceId: isUserAuthContext(authContext)
        ? authContext.userWorkspaceId
        : requestUserWorkspaceId,
      conversationViewer: {
        workspaceMemberId: isUserAuthContext(authContext)
          ? authContext.workspaceMemberId
          : undefined,
        applicationId: callerApplication?.id,
      },
    };
  }

  // the API key is looked up again, so a run continued after its revocation stops
  private async buildCallerContextOrThrow({
    workspace,
    callerRef,
    applicationAuthContext,
  }: {
    workspace: FlatWorkspace;
    callerRef: AgentRunCallerRef;
    applicationAuthContext?: ApplicationWorkspaceAuthContext;
  }): Promise<AgentRunCallerContext> {
    if (isDefined(callerRef.callerWorkspaceMemberId)) {
      const { authContext, actorContext } =
        await this.agentActorContextService.buildRunAsWorkspaceMemberContext({
          workspaceMemberId: callerRef.callerWorkspaceMemberId,
          workspaceId: workspace.id,
        });

      return { authContext, actorContext };
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
