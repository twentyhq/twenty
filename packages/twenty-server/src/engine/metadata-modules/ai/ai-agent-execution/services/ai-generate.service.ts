import { Injectable } from '@nestjs/common';

import {
  type GenerateResult,
  type RunAgentMessage,
} from 'twenty-shared/application';
import {
  AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
  aiRunScopeSchema,
  type AiRunScope,
} from 'twenty-shared/ai';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { buildActorMetadataFromAuthContext } from 'src/engine/core-modules/actor/utils/build-actor-metadata-from-auth-context.util';
import { buildCreatedByFromApplication } from 'src/engine/core-modules/actor/utils/build-created-by-from-application.util';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { buildApiKeyAuthContext } from 'src/engine/core-modules/auth/utils/build-api-key-auth-context.util';
import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AgentRunWithoutConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-without-conversation.service';
import { type AgentRunCallerContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-context.type';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { type AgentRunRoleIds } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-role-ids.type';
import { type OneShotAgentRun } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/one-shot-agent-run.type';
import { assertAgentResponseFormatHasOutputFieldsOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/assert-agent-response-format-has-output-fields-or-throw.util';
import { parseAgentResponseFormatOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/parse-agent-response-format-or-throw.util';
import { resolveRunAgentMessagesOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-run-agent-messages-or-throw.util';
import { AGENT_RUN_BASE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-run-base-system-prompt.const';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { resolveApplicationRoleId } from 'src/engine/twenty-orm/utils/resolve-application-role-id.util';

type GenerateServiceInput = {
  input: RunAgentMessage[];
  instructions?: string | null;
  modelId?: string | null;
  responseFormat?: unknown;
  scope?: unknown;
};

// One model call as the caller, with no agent and no conversation: its turn is the record
@Injectable()
export class AiGenerateService {
  constructor(
    private readonly agentActorContextService: AgentActorContextService,
    private readonly agentRunWithoutConversationService: AgentRunWithoutConversationService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
  ) {}

  async generate({
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
    input: GenerateServiceInput;
  }): Promise<GenerateResult> {
    const messages = resolveRunAgentMessagesOrThrow({ input: input.input });
    const responseFormat = parseAgentResponseFormatOrThrow(
      input.responseFormat,
    );
    const scope = this.parseScopeOrThrow(input.scope);

    assertAgentResponseFormatHasOutputFieldsOrThrow(responseFormat);

    const run = await this.agentRunWithoutConversationService.runOneShot({
      workspaceId: workspace.id,
      buildExecutionContext: () =>
        this.buildExecutionContext({
          workspace,
          requestUserWorkspaceId,
          requestWorkspaceMemberId,
          callerApplication,
          callerApiKey,
        }),
      spec: {
        agentId: null,
        inlineConfig: {
          instructions: input.instructions ?? '',
          modelId: input.modelId ?? AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
          modelConfiguration: null,
          scope,
          applicationId: callerApplication?.id ?? null,
          promptCacheKey: `ai-generate:${callerApplication?.id ?? workspace.id}`,
        },
        title: 'Generate',
        baseSystemPrompt: AGENT_RUN_BASE_SYSTEM_PROMPT,
        instructions: null,
        ...(isDefined(responseFormat) ? { responseFormat } : {}),
        capabilities: { canAskHumans: false },
      },
      messages,
    });

    return this.buildResult({
      run,
      isJsonResponse: responseFormat?.type === 'json',
    });
  }

  private buildResult({
    run: { turnId, outcome, summary },
    isJsonResponse,
  }: {
    run: OneShotAgentRun;
    isJsonResponse: boolean;
  }): GenerateResult {
    const usage = isDefined(summary)
      ? {
          inputTokens: summary.usage.inputTokens,
          outputTokens: summary.usage.outputTokens,
        }
      : null;

    if (outcome.status === 'FAILED') {
      return {
        success: false,
        text: null,
        object: null,
        error: outcome.error,
        turnId,
        usage,
      };
    }

    const result = isPlainObject(outcome.result) ? outcome.result : {};
    const response = result.response;

    return {
      success: true,
      text: isJsonResponse
        ? null
        : typeof response === 'string'
          ? response
          : '',
      object: isJsonResponse ? result : null,
      error: null,
      turnId,
      usage,
    };
  }

  // The call acts as whoever made it: a member, else the calling application, else an API key
  private async buildExecutionContext({
    workspace,
    requestUserWorkspaceId,
    requestWorkspaceMemberId,
    callerApplication,
    callerApiKey,
  }: {
    workspace: FlatWorkspace;
    requestUserWorkspaceId: string | null;
    requestWorkspaceMemberId: string | null;
    callerApplication?: FlatApplication;
    callerApiKey?: FlatApiKey;
  }): Promise<AgentRunExecutionContext> {
    const { authContext, actorContext, callerRoleIds } =
      await this.resolveCallerContext({
        workspace,
        requestUserWorkspaceId,
        requestWorkspaceMemberId,
        callerApplication,
        callerApiKey,
      });
    // a call through an application never exceeds that application
    const agentRunRoleIds: AgentRunRoleIds = {
      ...callerRoleIds,
      ...resolveApplicationRoleId({
        application: callerApplication,
        isMissingApplicationRoleTolerated: true,
      }),
    };

    return {
      authContext,
      actorContext,
      turnCreatedBy:
        actorContext ??
        (isDefined(callerApplication)
          ? buildCreatedByFromApplication({ application: callerApplication })
          : buildActorMetadataFromAuthContext(authContext)),
      userWorkspaceId: requestUserWorkspaceId,
      rolePermissionConfig: { intersectionOf: agentRunRoleIds },
      agentRunRoleIds,
      usageOperationType: UsageOperationType.AI_WORKFLOW_TOKEN,
    };
  }

  private async resolveCallerContext({
    workspace,
    requestUserWorkspaceId,
    requestWorkspaceMemberId,
    callerApplication,
    callerApiKey,
  }: {
    workspace: FlatWorkspace;
    requestUserWorkspaceId: string | null;
    requestWorkspaceMemberId: string | null;
    callerApplication?: FlatApplication;
    callerApiKey?: FlatApiKey;
  }): Promise<AgentRunCallerContext> {
    if (isDefined(requestWorkspaceMemberId)) {
      const { authContext, actorContext, roleId } =
        await this.agentActorContextService.buildRunAsWorkspaceMemberContext({
          workspaceMemberId: requestWorkspaceMemberId,
          workspaceId: workspace.id,
          viaApplication: callerApplication,
        });

      return {
        authContext,
        actorContext,
        callerRoleIds: { userWorkspaceRoleId: roleId },
      };
    }

    if (isDefined(callerApplication) && !isDefined(requestUserWorkspaceId)) {
      return {
        authContext: buildApplicationAuthContext({
          workspace,
          application: callerApplication,
        }),
      };
    }

    if (isDefined(callerApiKey)) {
      return {
        authContext: buildApiKeyAuthContext({
          workspace,
          apiKey: callerApiKey,
        }),
        callerRoleIds: {
          apiKeyRoleId: await this.apiKeyRoleService.getRoleIdForApiKeyId(
            callerApiKey.id,
            workspace.id,
          ),
        },
      };
    }

    throw new AiException(
      'Generating requires a workspace member, an API key or an application',
      AiExceptionCode.RUN_AGENT_NOT_ALLOWED,
    );
  }

  private parseScopeOrThrow(scope: unknown): AiRunScope | null {
    if (!isDefined(scope)) {
      return null;
    }

    const parsedScope = aiRunScopeSchema.safeParse(scope);

    if (!parsedScope.success) {
      throw new AiException(
        `Invalid scope: ${parsedScope.error.issues
          .map((issue) => issue.message)
          .join(', ')}`,
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    return parsedScope.data;
  }
}
