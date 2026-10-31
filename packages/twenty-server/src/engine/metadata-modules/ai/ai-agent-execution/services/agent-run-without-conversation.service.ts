import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunPersonaService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-persona.service';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { AgentRunTurnService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-turn.service';
import { type AgentRunCallerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-outcome.type';
import { type RunAgentJobData } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/run-agent-job-data.type';
import { buildAgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-summary.util';
import { addStepToAgentTurnUsage } from 'src/engine/metadata-modules/ai/ai-billing/utils/add-step-to-agent-turn-usage.util';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { mapErrorToStreamError } from 'src/engine/metadata-modules/ai/ai-history/utils/map-error-to-stream-error.util';
import { withDedicatedAiTrace } from 'src/engine/metadata-modules/ai/ai-models/utils/with-dedicated-ai-trace.util';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';

const NO_USAGE = {
  inputTokens: 0,
  outputTokens: 0,
  cacheReadTokens: 0,
  cacheCreationTokens: 0,
  inputCredits: 0,
  outputCredits: 0,
};

// A one-shot run: one turn on record and its outcome handed to the caller. Without a conversation
// nothing else writes to it and nothing can answer it, so it neither claims a thread nor pauses
@Injectable()
export class AgentRunWithoutConversationService {
  private readonly logger = new Logger(AgentRunWithoutConversationService.name);

  constructor(
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
    private readonly agentRunPersonaService: AgentRunPersonaService,
    private readonly agentRunTurnService: AgentRunTurnService,
    private readonly agentRunSuspensionService: AgentRunSuspensionService,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly turnRecorderService: AgentTurnRecorderService,
  ) {}

  async run({
    workspaceId,
    caller,
    spec,
    prompt,
  }: Omit<RunAgentJobData, 'conversation'>): Promise<void> {
    const handler = this.callerHandlerRegistry.getHandlerOrThrow(caller.type);

    if ((await handler.getWaitingState({ workspaceId, caller })) === 'GONE') {
      await this.agentRunSuspensionService.deliverOutcome({
        workspaceId,
        caller,
        threadId: null,
        outcome: {
          status: 'FAILED',
          error: 'The caller stopped waiting before the run started',
        },
        summary: null,
      });

      return;
    }

    const [executionContext, persona] = await Promise.all([
      handler.buildExecutionContext({ workspaceId, caller }),
      this.agentRunPersonaService.resolveOrThrow({ workspaceId, spec }),
    ]);
    const turnId = await this.conversationWriterService.insertTurn({
      workspaceId,
      threadId: null,
      agentId: persona.agentId,
      status: AgentTurnStatus.RUNNING,
      createdBy: executionContext.turnCreatedBy,
    });
    const startedAtMs = Date.now();
    const turnInput = {
      persona,
      messages: prompt?.messages ?? [],
      baseSystemPrompt: [
        spec.baseSystemPrompt,
        ...(isNonEmptyString(spec.instructions) ? [spec.instructions] : []),
      ].join('\n\n'),
      responseFormat:
        spec.responseFormat ?? persona.responseFormat ?? undefined,
      workspaceId,
      executionContext,
      additionalExcludedToolNames: spec.additionalExcludedToolNames,
      toolLoadingStrategy: spec.toolLoadingStrategy,
    };

    let outcome: AgentRunCallerOutcome;
    let summary = null;

    try {
      const execution = await workspaceAuthContextStorage.run(
        executionContext.authContext,
        () =>
          withDedicatedAiTrace(async () => {
            const started = await this.agentRunTurnService.startTurn(turnInput);
            const reader = started.source.parts.getReader();

            while (!(await reader.read()).done) {
              // the parts only matter to a conversation; reading them runs the loop to its end
            }

            const streamError = started.source.getStreamError();

            if (isDefined(streamError)) {
              throw streamError;
            }

            const completed = await this.agentRunTurnService.completeTurn({
              ...turnInput,
              started,
            });

            await this.turnRecorderService.recordUsage({
              workspaceId,
              turnId,
              threadId: null,
              usage: completed.steps.reduce(
                (usage, step) =>
                  addStepToAgentTurnUsage(
                    started.source.modelConfig,
                    usage,
                    step,
                  ),
                NO_USAGE,
              ),
            });

            return completed;
          }),
      );

      summary = buildAgentRunSummary({
        execution,
        durationMs: Date.now() - startedAtMs,
      });
      outcome = isDefined(execution.stopReason)
        ? {
            status: 'FAILED',
            error: 'Agent stopped: no more available credits.',
          }
        : { status: 'COMPLETED', result: execution.result };

      await this.turnRecorderService.finish({
        workspaceId,
        turnId,
        status:
          outcome.status === 'COMPLETED'
            ? AgentTurnStatus.COMPLETED
            : AgentTurnStatus.FAILED,
        modelId: execution.modelId,
      });
    } catch (error) {
      this.logger.error(
        `One-shot agent run of workspace ${workspaceId} failed`,
        error instanceof Error ? error.stack : error,
      );

      outcome = {
        status: 'FAILED',
        error: error instanceof Error ? error.message : String(error),
      };

      await this.turnRecorderService.finish({
        workspaceId,
        turnId,
        status: AgentTurnStatus.FAILED,
        error: mapErrorToStreamError(error),
      });
    }

    await this.agentRunSuspensionService.deliverOutcome({
      workspaceId,
      caller,
      threadId: null,
      outcome,
      summary,
    });
  }
}
