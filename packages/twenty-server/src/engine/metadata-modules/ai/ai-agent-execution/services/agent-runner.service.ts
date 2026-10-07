import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type AgentRunSummary } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { v4 } from 'uuid';

import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { AgentRunEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-run.entity';
import { AGENT_WAIT_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/agent-wait-prompt.constant';
import { createAgentWaitTools } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/create-agent-wait-tools.util';
import { findAgentRunWait } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/find-agent-run-wait.util';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentRunnerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-outcome.type';
import { type AgentRunnerRunInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-run-input.type';
import { type ContinueAgentRunJobData } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/continue-agent-run-job-data.type';
import { buildAgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-summary.util';
import { sumAgentRunSummaries } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/sum-agent-run-summaries.util';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AgentConversationReaderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-reader.service';
import { withDedicatedAiTrace } from 'src/engine/metadata-modules/ai/ai-models/utils/with-dedicated-ai-trace.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const AGENT_RUN_MAX_CONTINUATIONS = 50;

type AgentRunnerResult = {
  runId: string;
  threadId: string;
  outcome: AgentRunnerOutcome;
  // the run so far, across every segment of a continued run
  summary: AgentRunSummary;
};

// Runs an agent turn and records it in its conversation and as an agent run. A run that pauses on
// an answer or a wait is suspended: the engine continues it on its own, through this same runner,
// and hands the outcome to its caller's handler
@Injectable()
export class AgentRunnerService {
  private readonly logger = new Logger(AgentRunnerService.name);

  constructor(
    private readonly agentAsyncExecutorService: AgentAsyncExecutorService,
    private readonly agentRunConversationService: AgentRunConversationService,
    private readonly conversationReaderService: AgentConversationReaderService,
    private readonly agentRunService: AgentRunService,
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
    private readonly pendingWakeUpService: PendingWakeUpService,
    @InjectWorkspaceScopedRepository(AgentRunEntity)
    private readonly runRepository: WorkspaceScopedRepository<AgentRunEntity>,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
  ) {}

  // The caller gets the outcome back, so it is recorded on the run without the caller's handler
  async run(input: AgentRunnerRunInput): Promise<AgentRunnerResult> {
    const runId = input.runId ?? v4();
    let result: AgentRunnerResult;

    try {
      result = await this.runSegment({ input, runId, run: null });
    } catch (error) {
      await this.tryRecording(`record the failure of agent run ${runId}`, () =>
        this.agentRunService.recordOutcome({
          workspaceId: input.workspaceId,
          runId,
          outcome: {
            status: 'FAILED',
            error: error instanceof Error ? error.message : String(error),
          },
          summary: null,
        }),
      );

      throw error;
    }

    if (result.outcome.status !== 'SUSPENDED') {
      const { outcome, summary } = result;

      await this.tryRecording(`record the outcome of agent run ${runId}`, () =>
        this.agentRunService.recordOutcome({
          workspaceId: input.workspaceId,
          runId,
          outcome,
          summary,
        }),
      );
    }

    return result;
  }

  // Picks a suspended run up where it paused, with its answer or wait outcome already in its conversation
  async continue({
    workspaceId,
    runId,
    resumeCount,
  }: ContinueAgentRunJobData): Promise<void> {
    const run = await this.agentRunService.findSuspended({
      workspaceId,
      where: { id: runId },
    });

    if (!isDefined(run) || run.resumeCount !== resumeCount) {
      return;
    }

    const { caller, runSpec, threadId } = run;
    const handler = this.callerHandlerRegistry.getHandlerOrThrow(caller.type);

    if ((await handler.getWaitingState({ workspaceId, caller })) === 'GONE') {
      await this.agentRunService.release({ workspaceId, run });

      return;
    }

    // each continuation moves the count on, so of two deliveries of one continuation only the first
    // runs. The run stays SUSPENDED while it goes on, so its conversation stays closed to new messages
    const { affected } = await this.runRepository.update(
      workspaceId,
      { id: runId, status: 'SUSPENDED', resumeCount },
      { resumeCount: resumeCount + 1 },
    );

    if (affected === 0) {
      return;
    }

    let result: AgentRunnerResult;

    try {
      const agent = isDefined(runSpec.agentId)
        ? await this.agentRepository.findOne(workspaceId, {
            where: { id: runSpec.agentId },
          })
        : null;

      if (isDefined(runSpec.agentId) && !isDefined(agent)) {
        throw new AiException(
          `Agent with id ${runSpec.agentId} not found`,
          AiExceptionCode.AGENT_NOT_FOUND,
        );
      }

      result = await this.runSegment({
        input: {
          workspaceId,
          conversation: { threadId, isCreated: false },
          caller,
          spec: runSpec,
          agent,
          prompt: null,
          executionContext: await handler.buildExecutionContext({
            workspaceId,
            caller,
          }),
        },
        runId,
        run,
      });
    } catch (error) {
      await this.agentRunService.settle({
        workspaceId,
        run,
        outcome: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : String(error),
        },
      });

      return;
    }

    if (result.outcome.status !== 'SUSPENDED') {
      await this.agentRunService.settle({
        workspaceId,
        run,
        outcome: result.outcome,
        summary: result.summary,
      });
    }
  }

  // nothing else writes to the conversation while the run goes on: another run would read it half
  // written, and a run that suspends would read a member's message once it goes on
  private runSegment({
    input,
    runId,
    run,
  }: {
    input: AgentRunnerRunInput;
    runId: string;
    // the suspended run a continued run resumes from
    run: AgentRunEntity | null;
  }): Promise<AgentRunnerResult> {
    return this.agentRunConversationService.withThreadLock({
      workspaceId: input.workspaceId,
      threadId: input.conversation.threadId,
      work: () => this.runTurn({ input, runId, run }),
    });
  }

  private async runTurn({
    input,
    runId,
    run,
  }: {
    input: AgentRunnerRunInput;
    runId: string;
    run: AgentRunEntity | null;
  }): Promise<AgentRunnerResult> {
    const {
      workspaceId,
      conversation: { threadId, isCreated },
      caller,
      spec,
      agent,
      prompt,
      executionContext,
    } = input;
    const agentId = agent?.id ?? null;

    if (!isDefined(run)) {
      if (!isCreated) {
        await this.agentRunService.assertConversationNotSuspended({
          workspaceId,
          threadId,
        });
      }

      await this.runRepository.insert(workspaceId, {
        id: runId,
        threadId,
        caller,
        runSpec: spec,
        status: 'RUNNING',
      } as QueryDeepPartialEntity<AgentRunEntity>);
    }

    const priorMessages = isCreated
      ? []
      : await this.conversationReaderService.loadMessages({
          workspaceId,
          threadId,
          actor: executionContext.conversationActor,
        });

    const turnId = await this.tryRecording(
      `record the agent turn in thread ${threadId}`,
      () =>
        this.agentRunConversationService.openTurn({
          workspaceId,
          threadId,
          title: spec.title,
          agentId,
          senderUserWorkspaceId: prompt?.senderUserWorkspaceId ?? null,
          senderApplicationId: prompt?.senderApplicationId ?? null,
          createdBy: executionContext.turnCreatedBy,
          messages: prompt?.messages ?? [],
        }),
    );

    const startedAtMs = Date.now();

    let execution: AgentExecutionResult;

    try {
      // the toolset and prompt come from the spec alone, so a continued run gets those it paused with
      execution = await withDedicatedAiTrace(() =>
        this.agentAsyncExecutorService.executeAgent({
          agent,
          messages: prompt?.messages ?? [],
          priorMessages,
          // every run here goes on in the background, unlike a chat, so it can wait. The wait tools are
          // the engine's, so it explains them; the caller's own instructions come last
          baseSystemPrompt: [
            spec.baseSystemPrompt,
            AGENT_WAIT_PROMPT,
            ...(isNonEmptyString(spec.instructions) ? [spec.instructions] : []),
          ].join('\n\n'),
          pausingTools: createAgentWaitTools(),
          canAskHumans: spec.capabilities.canAskHumans,
          workspaceId,
          executionContext,
          additionalExcludedToolNames: spec.additionalExcludedToolNames,
          toolLoadingStrategy: spec.toolLoadingStrategy,
        }),
      );
    } catch (error) {
      if (isDefined(turnId)) {
        await this.tryRecording(
          `record the agent turn in thread ${threadId}`,
          () =>
            this.agentRunConversationService.failTurn({
              workspaceId,
              turnId,
              error,
            }),
        );
      }

      throw error;
    }

    const durationMs = Date.now() - startedAtMs;

    const closedTurn = isDefined(turnId)
      ? await this.tryRecording(
          `record the agent turn in thread ${threadId}`,
          () =>
            this.agentRunConversationService.closeTurn({
              workspaceId,
              threadId,
              turnId,
              title: spec.title,
              agentId,
              execution,
            }),
        )
      : null;

    const summary = sumAgentRunSummaries({
      previousSummary: run?.summary ?? null,
      nextSummary: buildAgentRunSummary({ execution, durationMs }),
    });

    return {
      runId,
      threadId,
      summary,
      outcome: await this.settleTurn({
        input,
        execution,
        closedTurn,
        summary,
        runId,
        run,
      }),
    };
  }

  private async settleTurn({
    input: { workspaceId, conversation },
    execution,
    closedTurn,
    summary,
    runId,
    run,
  }: {
    input: AgentRunnerRunInput;
    execution: AgentExecutionResult;
    // null when the turn could not be recorded
    closedTurn: { isAwaitingAnswer: boolean } | null;
    summary: AgentRunSummary;
    runId: string;
    run: AgentRunEntity | null;
  }): Promise<AgentRunnerOutcome> {
    if (!execution.hasNoMoreAvailableCredits && !execution.isPaused) {
      return { status: 'COMPLETED', result: execution.result };
    }

    const { threadId } = conversation;
    const wait = findAgentRunWait(
      execution.steps[execution.steps.length - 1]?.toolResults ?? [],
    );
    const hasPausedTooOften =
      isDefined(run) && run.resumeCount + 1 >= AGENT_RUN_MAX_CONTINUATIONS;

    // continuing reads the conversation, so a pause it does not hold could never be continued.
    // A failure to suspend only fails the run, like a pause that could not be recorded
    const isSuspended =
      !execution.hasNoMoreAvailableCredits &&
      !hasPausedTooOften &&
      isDefined(closedTurn) &&
      (closedTurn.isAwaitingAnswer || isDefined(wait)) &&
      (await this.tryRecording(
        `suspend the agent run in thread ${threadId}`,
        async () => {
          // a caller that stopped waiting while a continued run went on has released it
          const { affected } = await this.runRepository.update(
            workspaceId,
            { id: runId, status: isDefined(run) ? 'SUSPENDED' : 'RUNNING' },
            {
              status: 'SUSPENDED',
              summary,
            } as QueryDeepPartialEntity<AgentRunEntity>,
          );

          return affected !== 0;
        },
      )) === true;

    if (!isSuspended) {
      // a pause the run could not keep leaves nothing to answer
      const startedRun = isDefined(run)
        ? null
        : await this.agentRunService.findOne({ workspaceId, id: runId });

      if (isDefined(startedRun)) {
        await this.agentRunService.closeAwaitedCalls({
          workspaceId,
          run: startedRun,
        });
      }

      if (execution.hasNoMoreAvailableCredits) {
        return {
          status: 'FAILED',
          error: 'Agent stopped: no more available credits.',
        };
      }

      if (hasPausedTooOften) {
        return {
          status: 'FAILED',
          error: `Agent stopped: it paused more than ${AGENT_RUN_MAX_CONTINUATIONS} times in one run.`,
        };
      }

      if (isDefined(wait)) {
        return {
          status: 'FAILED',
          error:
            'Agent paused to wait but its conversation could not be recorded.',
        };
      }

      return {
        status: 'FAILED',
        error: 'Agent asked a question that could not be recorded.',
      };
    }

    if (isDefined(wait)) {
      await this.pendingWakeUpService.arm({
        workspaceId,
        owner: { type: 'AGENT_RUN', id: runId, key: wait.toolCallId },
        condition: wait.condition,
      });
    }

    return { status: 'SUSPENDED' };
  }

  // A record of the run, not its outcome, so a write failure must not fail the run
  private async tryRecording<TResult>(
    description: string,
    record: () => Promise<TResult>,
  ): Promise<TResult | null> {
    try {
      return await record();
    } catch (error) {
      this.logger.error(
        `Failed to ${description}`,
        error instanceof Error ? error.stack : error,
      );

      return null;
    }
  }
}
