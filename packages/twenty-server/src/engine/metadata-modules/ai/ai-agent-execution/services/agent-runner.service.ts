import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type AgentRunSummary } from 'twenty-shared/ai';
import { type PendingWakeUpCondition } from 'twenty-shared/pending-wake-up';
import { isDefined } from 'twenty-shared/utils';

import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { AGENT_WAIT_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/agent-wait-prompt.constant';
import { createAgentWaitTools } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/create-agent-wait-tools.util';
import { findAgentRunWait } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/find-agent-run-wait.util';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentRunnerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-outcome.type';
import { type AgentRunnerRunInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-run-input.type';
import { type AgentRunSuspension } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-suspension.type';
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
  threadId: string;
  outcome: AgentRunnerOutcome;
  // the run so far, across every segment of a continued run
  summary: AgentRunSummary;
};

// Runs an agent turn and records it in its conversation. A run that pauses on an answer or a wait
// is suspended: the engine continues it on its own, through this same runner, and hands the
// outcome to its caller's handler
@Injectable()
export class AgentRunnerService {
  private readonly logger = new Logger(AgentRunnerService.name);

  constructor(
    private readonly agentAsyncExecutorService: AgentAsyncExecutorService,
    private readonly agentRunConversationService: AgentRunConversationService,
    private readonly conversationReaderService: AgentConversationReaderService,
    private readonly agentRunSuspensionService: AgentRunSuspensionService,
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
    private readonly pendingWakeUpService: PendingWakeUpService,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
  ) {}

  // nothing else writes to the conversation while the run goes on: another run would read it half
  // written, and a run that suspends would read a member's message once it goes on
  run(input: AgentRunnerRunInput): Promise<AgentRunnerResult> {
    return this.agentRunConversationService.withThreadLock({
      workspaceId: input.workspaceId,
      threadId: input.conversation.threadId,
      work: () => this.runTurn({ input, suspension: null }),
    });
  }

  // Picks a suspended run up where it paused once its wake-up resolved, under its conversation's lock.
  // The wake-up is removed only once the run went on and its caller has the outcome, so a job that
  // died or failed midway finds it again, and a pause the run made again replaced it with another
  // id, so each pause goes on once
  continue({
    workspaceId,
    threadId,
    wakeUpId,
    outcome,
  }: ContinueAgentRunJobData): Promise<void> {
    return this.agentRunConversationService.withThreadLock({
      workspaceId,
      threadId,
      work: async () => {
        const wakeUp = await this.pendingWakeUpService.find({
          workspaceId,
          wakeUpId,
        });

        if (!isDefined(wakeUp)) {
          return;
        }

        await this.continueSuspendedRun({
          workspaceId,
          threadId,
          wakeUp,
          outcome,
        });

        await this.pendingWakeUpService.claim({ workspaceId, wakeUpId });
      },
    });
  }

  private async continueSuspendedRun({
    workspaceId,
    threadId,
    wakeUp,
    outcome,
  }: Omit<ContinueAgentRunJobData, 'wakeUpId'> & {
    wakeUp: Pick<PendingWakeUpEntity, 'payload' | 'condition'>;
  }): Promise<void> {
    const suspension = wakeUp.payload as AgentRunSuspension;
    const isAwaitingAnswer = wakeUp.condition.type === 'ANSWER';
    const { caller, runSpec } = suspension;
    const handler = this.callerHandlerRegistry.getHandlerOrThrow(caller.type);

    let result: AgentRunnerResult;

    // a run that cannot go on is settled rather than left paused
    try {
      if ((await handler.getWaitingState({ workspaceId, caller })) === 'GONE') {
        await this.agentRunSuspensionService.closeAwaitedCalls({
          workspaceId,
          threadId,
          isAwaitingAnswer,
        });

        return;
      }

      if (outcome.type === 'ANSWERED' && 'error' in outcome.answer) {
        throw new Error(outcome.answer.error);
      }

      // a wait the run called alongside a question is over once the question is answered
      await this.agentRunSuspensionService.recordWaitOutcome({
        workspaceId,
        threadId,
        outcome: outcome.type === 'ANSWERED' ? { type: 'CANCELLED' } : outcome,
      });

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

      result = await this.runTurn({
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
        suspension,
      });
    } catch (error) {
      await this.agentRunSuspensionService.settle({
        workspaceId,
        threadId,
        suspension,
        outcome: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : String(error),
        },
        isAwaitingAnswer,
      });

      return;
    }

    if (result.outcome.status !== 'SUSPENDED') {
      await this.agentRunSuspensionService.settle({
        workspaceId,
        threadId,
        suspension,
        outcome: result.outcome,
        summary: result.summary,
      });
    }
  }

  private async runTurn({
    input,
    suspension,
  }: {
    input: AgentRunnerRunInput;
    // what a continued run resumes from
    suspension: AgentRunSuspension | null;
  }): Promise<AgentRunnerResult> {
    const {
      workspaceId,
      conversation: { threadId, isCreated },
      spec,
      agent,
      prompt,
      executionContext,
    } = input;
    const agentId = agent?.id ?? null;

    if (!isCreated && !isDefined(suspension)) {
      await this.agentRunSuspensionService.assertConversationNotSuspended({
        workspaceId,
        threadId,
      });
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
      previousSummary: suspension?.summary ?? null,
      nextSummary: buildAgentRunSummary({ execution, durationMs }),
    });

    return {
      threadId,
      summary,
      outcome: await this.settleTurn({
        input,
        execution,
        closedTurn,
        summary,
        suspension,
      }),
    };
  }

  private async settleTurn({
    input: { workspaceId, conversation, caller, spec },
    execution,
    closedTurn,
    summary,
    suspension,
  }: {
    input: AgentRunnerRunInput;
    execution: AgentExecutionResult;
    // null when the turn could not be recorded
    closedTurn: { isAwaitingAnswer: boolean } | null;
    summary: AgentRunSummary;
    suspension: AgentRunSuspension | null;
  }): Promise<AgentRunnerOutcome> {
    if (!execution.hasNoMoreAvailableCredits && !execution.isPaused) {
      return { status: 'COMPLETED', result: execution.result };
    }

    const { threadId } = conversation;
    const wait = findAgentRunWait(
      execution.steps[execution.steps.length - 1]?.toolResults ?? [],
    );
    const continuationCount = isDefined(suspension)
      ? suspension.continuationCount + 1
      : 0;
    const hasPausedTooOften = continuationCount >= AGENT_RUN_MAX_CONTINUATIONS;
    // a run waits on the questions it asked rather than on a wait it called alongside them
    const condition: PendingWakeUpCondition | undefined =
      closedTurn?.isAwaitingAnswer === true
        ? { type: 'ANSWER', threadId }
        : wait?.condition;

    // continuing reads the conversation, so a pause it does not hold could never be continued.
    // A failure to suspend only fails the run, like a pause that could not be recorded
    const isSuspended =
      !execution.hasNoMoreAvailableCredits &&
      !hasPausedTooOften &&
      isDefined(closedTurn) &&
      isDefined(condition) &&
      (await this.tryRecording(
        `suspend the agent run in thread ${threadId}`,
        async () => {
          await this.agentRunSuspensionService.suspend({
            workspaceId,
            threadId,
            condition,
            suspension: { caller, runSpec: spec, summary, continuationCount },
          });

          // a caller that stopped waiting while a continued run went on found no wake-up to release,
          // and it stops waiting before it releases, so reading it after the pause is saved misses none.
          // A caller that cannot be read fails the run, rather than leave a pause no one may release
          const isCallerGone =
            isDefined(suspension) &&
            (await this.callerHandlerRegistry
              .getHandlerOrThrow(caller.type)
              .getWaitingState({ workspaceId, caller })
              .catch(() => 'GONE')) === 'GONE';

          if (isCallerGone) {
            await this.pendingWakeUpService.cancel({
              workspaceId,
              owner: { type: 'AGENT_RUN', id: threadId },
            });
          }

          return !isCallerGone;
        },
      )) === true;

    if (isSuspended) {
      return { status: 'SUSPENDED' };
    }

    // a pause the run could not keep leaves nothing to answer
    await this.agentRunSuspensionService.closeAwaitedCalls({
      workspaceId,
      threadId,
      isAwaitingAnswer: closedTurn?.isAwaitingAnswer === true,
    });

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
