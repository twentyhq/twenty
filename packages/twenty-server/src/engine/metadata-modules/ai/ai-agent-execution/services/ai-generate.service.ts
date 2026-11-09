import { Injectable } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import {
  generateJsonFieldsSchema,
  type GenerateResult,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AgentRunCallerContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-context.service';
import { type GenerateInputDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/generate.input';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { buildAgentRunStreamChannelId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-stream-channel-id.util';
import { assertAgentResponseFormatHasOutputFieldsOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/assert-agent-response-format-has-output-fields-or-throw.util';
import { parseAgentInputOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/parse-agent-input-or-throw.util';
import { readGeneratedOutputOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/read-generated-output-or-throw.util';
import { resolveRunAgentMessagesOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-run-agent-messages-or-throw.util';
import { resolveAgentRunCallerRefOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-agent-run-caller-ref-or-throw.util';
import { resolveAgentRunStreamOwnerOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-agent-run-stream-owner-or-throw.util';
import { AGENT_RUN_BASE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-run-base-system-prompt.const';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { isUniqueViolationError } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-unique-violation-error.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const buildRunAlreadyExistsException = (runId: string) =>
  new AiException(
    `Run ${runId} already exists; pass a new runId`,
    AiExceptionCode.INVALID_AGENT_INPUT,
  );

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
    input: GenerateInputDTO;
  }): Promise<GenerateResult> {
    const messages = resolveRunAgentMessagesOrThrow({ input: input.input });
    const jsonFields = parseAgentInputOrThrow({
      schema: generateJsonFieldsSchema,
      input: { responseFormat: input.responseFormat, scope: input.scope },
    });
    const responseFormat = jsonFields.responseFormat ?? undefined;
    const requestedRunId = input.runId ?? undefined;

    assertAgentResponseFormatHasOutputFieldsOrThrow(responseFormat);

    // the application's role is the ceiling of what its generate may reach, so it cannot run without one. The AI
    // guard refuses other roleless applications first; an OAuth-only one acting with its member's role gets here
    if (
      isDefined(callerApplication) &&
      !isDefined(callerApplication.defaultRoleId)
    ) {
      throw new AiException(
        'ai.generate needs a default role on the application; declare one with defineApplicationRole()',
        AiExceptionCode.RUN_AGENT_NOT_ALLOWED,
      );
    }

    const streamChannelId = isDefined(requestedRunId)
      ? await this.resolveStreamChannelIdOrThrow({
          workspaceId: workspace.id,
          callerApplication,
          callerWorkspaceMemberId: requestWorkspaceMemberId,
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

    const { runId, outcome, usage } = await this.agentRunnerService
      .runInRequest({
        workspaceId: workspace.id,
        executionContext,
        spec: {
          agentId: null,
          inlineConfig: {
            instructions: input.instructions ?? '',
            modelId: input.modelId ?? AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
            modelConfiguration: null,
            scope: jsonFields.scope ?? null,
            // a call without an application belongs to the workspace custom application
            applicationId:
              callerApplication?.id ?? workspace.workspaceCustomApplicationId,
            promptCacheKey: `ai-generate:${callerApplication?.id ?? workspace.id}`,
          },
          title: 'Generate',
          baseSystemPrompt: AGENT_RUN_BASE_SYSTEM_PROMPT,
          instructions: null,
          responseFormat,
          capabilities: { canAskHumans: false },
        },
        turnId: requestedRunId ?? randomUUID(),
        prompt: {
          messages,
          senderUserWorkspaceId: requestUserWorkspaceId,
          senderApplicationId: callerApplication?.id ?? null,
        },
        streamChannelId,
      })
      .catch((error: unknown) => {
        if (isDefined(requestedRunId) && isUniqueViolationError(error)) {
          throw buildRunAlreadyExistsException(requestedRunId);
        }

        throw error;
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

  private async resolveStreamChannelIdOrThrow({
    workspaceId,
    callerApplication,
    callerWorkspaceMemberId,
    runId,
  }: {
    workspaceId: string;
    callerApplication: Pick<FlatApplication, 'id'> | undefined;
    callerWorkspaceMemberId: string | null;
    runId: string;
  }): Promise<string> {
    const owner = resolveAgentRunStreamOwnerOrThrow({
      callerApplication,
      callerWorkspaceMemberId,
    });

    // a concurrent call that passes this check still fails on the turn's primary key
    const existingTurn = await this.turnRepository.findOne(workspaceId, {
      where: { id: runId },
      select: ['id'],
    });

    if (isDefined(existingTurn)) {
      throw buildRunAlreadyExistsException(runId);
    }

    return buildAgentRunStreamChannelId({ owner, runId });
  }
}
