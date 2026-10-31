import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type RunAgentMessage } from 'twenty-shared/application';
import { type AgentRunSummary } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunPersonaService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-persona.service';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { AgentRunTurnService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-turn.service';
import { type AgentRunCallerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-outcome.type';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { type AgentRunSpec } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-spec.type';
import { type AgentStructuredOutputStrategy } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-structured-output-strategy.type';
import { type OneShotAgentRun } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/one-shot-agent-run.type';
import { type RunAgentJobData } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/run-agent-job-data.type';
import { buildAgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-summary.util';
import { AGENT_RUN_OUT_OF_CREDITS_ERROR } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-out-of-credits-error.const';
import { type AgentTurnUsage } from 'src/engine/metadata-modules/ai/ai-billing/types/agent-turn-usage.type';
import { addStepToAgentTurnUsage } from 'src/engine/metadata-modules/ai/ai-billing/utils/add-step-to-agent-turn-usage.util';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { mapErrorToStreamError } from 'src/engine/metadata-modules/ai/ai-history/utils/map-error-to-stream-error.util';
import { withDedicatedAiTrace } from 'src/engine/metadata-modules/ai/ai-models/utils/with-dedicated-ai-trace.util';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';

const NO_USAGE: AgentTurnUsage = {
  inputTokens: 0,
  outputTokens: 0,
  cacheReadTokens: 0,
  cacheCreationTokens: 0,
  inputCredits: 0,
  outputCredits: 0,
};

// A one-shot run records one turn and hands its outcome to the caller, with no thread and no pause
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
  }: Pick<
    RunAgentJobData,
    'workspaceId' | 'caller' | 'spec' | 'prompt'
  >): Promise<void> {
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

    const { outcome, summary } = await this.runOneShot({
      workspaceId,
      buildExecutionContext: () =>
        handler.buildExecutionContext({ workspaceId, caller }),
      spec,
      messages: prompt?.messages ?? [],
    });

    await this.agentRunSuspensionService.deliverOutcome({
      workspaceId,
      caller,
      threadId: null,
      outcome,
      summary,
    });
  }

  async runOneShot({
    workspaceId,
    buildExecutionContext,
    spec,
    messages,
    structuredOutputStrategy,
  }: {
    workspaceId: string;
    buildExecutionContext: () => Promise<AgentRunExecutionContext>;
    spec: AgentRunSpec;
    messages: RunAgentMessage[];
    structuredOutputStrategy?: AgentStructuredOutputStrategy;
  }): Promise<OneShotAgentRun> {
    let turnId: string | null = null;
    // usage is read as each step ends, so a run that fails midway still records what it spent
    let usage: AgentTurnUsage = NO_USAGE;
    let outcome: AgentRunCallerOutcome;
    let summary: AgentRunSummary | null = null;

    // whatever fails, the caller gets an outcome, so a workflow step never stays pending
    try {
      const [executionContext, persona] = await Promise.all([
        buildExecutionContext(),
        this.agentRunPersonaService.resolveOrThrow({ workspaceId, spec }),
      ]);
      const runTurnId = await this.conversationWriterService.insertTurn({
        workspaceId,
        threadId: null,
        agentId: persona.agentId,
        status: AgentTurnStatus.RUNNING,
        createdBy: executionContext.turnCreatedBy,
      });

      turnId = runTurnId;

      const startedAtMs = Date.now();
      const turnInput = {
        persona,
        messages,
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
        structuredOutputStrategy,
      };

      const execution = await workspaceAuthContextStorage.run(
        executionContext.authContext,
        () =>
          withDedicatedAiTrace(async () => {
            const started = await this.agentRunTurnService.startTurn(turnInput);
            const { modelConfig } = started.source;
            const reader = started.source.parts.getReader();

            for (
              let read = await reader.read();
              !read.done;
              read = await reader.read()
            ) {
              if (read.value.type === 'finish-step') {
                usage = addStepToAgentTurnUsage(modelConfig, usage, read.value);
              }
            }

            const streamError = started.source.getStreamError?.();

            if (isDefined(streamError)) {
              throw streamError;
            }

            const completed = await this.agentRunTurnService.completeTurn({
              ...turnInput,
              started,
            });

            usage = completed.structuredOutputSteps.reduce(
              (turnUsage, step) =>
                addStepToAgentTurnUsage(modelConfig, turnUsage, step),
              usage,
            );

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
            error: AGENT_RUN_OUT_OF_CREDITS_ERROR,
          }
        : { status: 'COMPLETED', result: execution.result };

      // the record of the run must not overturn its outcome
      await this.turnRecorderService
        .finish({
          workspaceId,
          turnId: runTurnId,
          status:
            outcome.status === 'COMPLETED'
              ? AgentTurnStatus.COMPLETED
              : AgentTurnStatus.FAILED,
          modelId: execution.modelId,
        })
        .catch((finishError: unknown) =>
          this.logger.error(
            `Could not record the end of turn ${runTurnId}`,
            finishError instanceof Error ? finishError.stack : finishError,
          ),
        );
    } catch (error) {
      this.logger.error(
        `One-shot agent run of workspace ${workspaceId} failed`,
        error instanceof Error ? error.stack : error,
      );

      outcome = {
        status: 'FAILED',
        error: error instanceof Error ? error.message : String(error),
      };

      if (isDefined(turnId)) {
        await this.turnRecorderService
          .finish({
            workspaceId,
            turnId,
            status: AgentTurnStatus.FAILED,
            error: mapErrorToStreamError(error),
          })
          .catch((finishError: unknown) =>
            this.logger.error(
              `Could not record the failure of turn ${turnId}`,
              finishError instanceof Error ? finishError.stack : finishError,
            ),
          );
      }
    }

    if (isDefined(turnId)) {
      await this.turnRecorderService
        .recordUsage({ workspaceId, turnId, threadId: null, usage })
        .catch((recordError: unknown) =>
          this.logger.error(
            `Could not record the usage of turn ${turnId}`,
            recordError instanceof Error ? recordError.stack : recordError,
          ),
        );
    }

    return { turnId, outcome, summary };
  }
}
