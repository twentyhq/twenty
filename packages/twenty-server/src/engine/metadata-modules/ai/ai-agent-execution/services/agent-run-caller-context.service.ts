import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { ApiKeyService } from 'src/engine/core-modules/api-key/services/api-key.service';
import { fromApiKeyEntityToFlat } from 'src/engine/core-modules/api-key/utils/from-api-key-entity-to-flat.util';
import { type ApplicationWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildApiKeyAuthContext } from 'src/engine/core-modules/auth/utils/build-api-key-auth-context.util';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { type AgentRunCallerContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-context.type';
import { type AgentRunCallerRef } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-ref.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class AgentRunCallerContextService {
  constructor(
    private readonly agentActorContextService: AgentActorContextService,
    private readonly apiKeyService: ApiKeyService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
  ) {}

  // the API key is looked up again, so a run continued after its revocation stops
  async buildCallerContext({
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
