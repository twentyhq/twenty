import { Injectable } from '@nestjs/common';

import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import {
  generateInputSchema,
  type GenerateResult,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AgentRunCallerContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-context.service';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { buildAgentRunStreamChannelId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-stream-channel-id.util';
import { assertAgentResponseFormatHasOutputFieldsOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/assert-agent-response-format-has-output-fields-or-throw.util';
import { parseAgentInputOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/parse-agent-input-or-throw.util';
import { readGeneratedOutputOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/read-generated-output-or-throw.util';
import { resolveAgentRunCallerRefOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-agent-run-caller-ref-or-throw.util';
import { AGENT_RUN_BASE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-run-base-system-prompt.const';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class AiGenerateService {
  constructor(
    private readonly agentRunCallerContextService: AgentRunCallerContextService,
    private readonly agentRunnerService: AgentRunnerService,
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnWorkspaceEntity>,
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
    input: unknown;
  }): Promise<GenerateResult> {
    const { input: messages, ...settings } = parseAgentInputOrThrow({
      schema: generateInputSchema,
      input,
    });
    const responseFormat = settings.responseFormat ?? undefined;
    const requestedRunId = settings.runId ?? undefined;

    assertAgentResponseFormatHasOutputFieldsOrThrow(responseFormat);

    const streamChannelId = isDefined(requestedRunId)
      ? await this.resolveStreamChannelIdOrThrow({
          workspaceId: workspace.id,
          callerApplication,
          runId: requestedRunId,
        })
      : undefined;

    const executionContext =
      await this.agentRunCallerContextService.buildExecutionContext({
        workspace,
        callerRef: resolveAgentRunCallerRefOrThrow({
          callerApplication,
          callerApiKey,
          requestUserWorkspaceId,
          requestWorkspaceMemberId,
        }),
        requestUserWorkspaceId,
        application: callerApplication,
        callerApplication,
      });

    const { runId, outcome, usage } =
      await this.agentRunnerService.runInRequest({
        workspaceId: workspace.id,
        executionContext,
        spec: {
          agentId: null,
          inlineConfig: {
            instructions: settings.instructions ?? '',
            modelId: settings.modelId ?? AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
            modelConfiguration: null,
            scope: settings.scope ?? null,
            applicationId: callerApplication?.id ?? null,
            promptCacheKey: `ai-generate:${callerApplication?.id ?? workspace.id}`,
          },
          title: 'Generate',
          baseSystemPrompt: AGENT_RUN_BASE_SYSTEM_PROMPT,
          instructions: null,
          responseFormat,
          capabilities: { canAskHumans: false },
          structuredOutputStrategy: 'same-request',
        },
        prompt: {
          messages,
          senderUserWorkspaceId: requestUserWorkspaceId,
          senderApplicationId: callerApplication?.id ?? null,
          turnId: requestedRunId,
        },
        streamChannelId,
      });

    const output = readGeneratedOutputOrThrow({
      outcome,
      isJsonResponse: responseFormat?.type === 'json',
    });

    return {
      ...output,
      success: !isDefined(output.error),
      runId,
      usage,
    };
  }

  // keyed by the caller app so an app follows only its own runs; the turn's primary key backs the lookup in a race
  private async resolveStreamChannelIdOrThrow({
    workspaceId,
    callerApplication,
    runId,
  }: {
    workspaceId: string;
    callerApplication: Pick<FlatApplication, 'id'> | undefined;
    runId: string;
  }): Promise<string> {
    if (!isDefined(callerApplication)) {
      throw new AiException(
        'runId needs an application access token',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    const existingTurn = await this.turnRepository.findOne(workspaceId, {
      where: { id: runId },
      select: ['id'],
    });

    if (isDefined(existingTurn)) {
      throw new AiException(
        `Run ${runId} already exists; pass a new runId`,
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    return buildAgentRunStreamChannelId({
      applicationId: callerApplication.id,
      runId,
    });
  }
}
