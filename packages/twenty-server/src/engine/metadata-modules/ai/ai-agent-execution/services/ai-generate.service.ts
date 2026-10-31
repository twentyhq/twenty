import { Injectable } from '@nestjs/common';

import { isString } from '@sniptt/guards';
import {
  type GenerateResult,
  type RunAgentMessage,
} from 'twenty-shared/application';
import {
  AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
  type AiRunScope,
} from 'twenty-shared/ai';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { aiRunScopeSchema } from 'twenty-shared/workflow';

import { buildActorMetadataFromAuthContext } from 'src/engine/core-modules/actor/utils/build-actor-metadata-from-auth-context.util';
import { buildCreatedByFromApplication } from 'src/engine/core-modules/actor/utils/build-created-by-from-application.util';
import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AgentRunCallerContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-context.service';
import { AgentRunWithoutConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-without-conversation.service';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { type AgentRunRoleIds } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-role-ids.type';
import { type OneShotAgentRun } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/one-shot-agent-run.type';
import { assertAgentResponseFormatHasOutputFieldsOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/assert-agent-response-format-has-output-fields-or-throw.util';
import { parseAgentResponseFormatOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/parse-agent-response-format-or-throw.util';
import { resolveAgentRunCallerRefOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-agent-run-caller-ref-or-throw.util';
import { resolveRunAgentMessagesOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-run-agent-messages-or-throw.util';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { AGENT_RUN_BASE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-run-base-system-prompt.const';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { resolveApplicationRoleId } from 'src/engine/permissions/principal/utils/resolve-application-role-id.util';

type GenerateServiceInput = {
  input: RunAgentMessage[];
  instructions?: string | null;
  modelId?: string | null;
  responseFormat?: unknown;
  scope?: unknown;
};

@Injectable()
export class AiGenerateService {
  constructor(
    private readonly agentRunCallerContextService: AgentRunCallerContextService,
    private readonly agentRunWithoutConversationService: AgentRunWithoutConversationService,
    private readonly conversationWriterService: AgentConversationWriterService,
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

    if (
      !(await this.conversationWriterService.canInsertTurnWithoutThread(
        workspace.id,
      ))
    ) {
      throw new AiException(
        'AI generation is available once this workspace finishes upgrading',
        AiExceptionCode.GENERATE_UPGRADE_IN_PROGRESS,
      );
    }

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
      structuredOutputStrategy: 'same-request',
    });

    return this.buildResult({
      run,
      isJsonResponse: responseFormat?.type === 'json',
    });
  }

  private buildResult({
    run: { turnId, outcome, usage: runUsage },
    isJsonResponse,
  }: {
    run: OneShotAgentRun;
    isJsonResponse: boolean;
  }): GenerateResult {
    const usage = isDefined(runUsage)
      ? {
          inputTokens: runUsage.inputTokens,
          outputTokens: runUsage.outputTokens,
        }
      : null;

    const buildFailure = (error: string): GenerateResult => ({
      success: false,
      text: null,
      object: null,
      error,
      turnId,
      usage,
    });

    if (outcome.status === 'FAILED') {
      return buildFailure(outcome.error);
    }

    if (!isPlainObject(outcome.result)) {
      return buildFailure('The run returned no result');
    }

    if (isJsonResponse) {
      return {
        success: true,
        text: null,
        object: outcome.result,
        error: null,
        turnId,
        usage,
      };
    }

    if (!isString(outcome.result.response)) {
      return buildFailure('The run returned no text');
    }

    return {
      success: true,
      text: outcome.result.response,
      object: null,
      error: null,
      turnId,
      usage,
    };
  }

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
      await this.agentRunCallerContextService.buildCallerContext({
        workspace,
        callerRef: resolveAgentRunCallerRefOrThrow({
          callerApplication,
          callerApiKey,
          requestUserWorkspaceId,
          requestWorkspaceMemberId,
        }),
        applicationAuthContext: isDefined(callerApplication)
          ? buildApplicationAuthContext({
              workspace,
              application: callerApplication,
            })
          : undefined,
      });
    const createdBy =
      actorContext ??
      (isDefined(callerApplication)
        ? buildCreatedByFromApplication({ application: callerApplication })
        : buildActorMetadataFromAuthContext(authContext));
    // the application stays on the turn when a member made it, so it can read the run back
    const turnCreatedBy = isDefined(callerApplication)
      ? {
          ...createdBy,
          context: {
            ...createdBy.context,
            applicationId: callerApplication.id,
          },
        }
      : createdBy;
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
      turnCreatedBy,
      userWorkspaceId: requestUserWorkspaceId,
      rolePermissionConfig: { intersectionOf: agentRunRoleIds },
      agentRunRoleIds,
      usageOperationType: UsageOperationType.AI_WORKFLOW_TOKEN,
    };
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
