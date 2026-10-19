import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { generateId } from 'ai';
import { type AgentRunSummary } from 'twenty-shared/ai';
import { type PendingWakeUpCondition } from 'twenty-shared/pending-wake-up';
import { isDefined } from 'twenty-shared/utils';

import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { RUN_AGENT_MAX_WAIT_MS } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/run-agent-max-wait-ms.const';
import { AGENT_RUN_BUSY_RETRY_DELAY_MS } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-busy-retry-delay-ms.const';
import { CONTINUE_AGENT_RUN_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/continue-agent-run-job-name.constant';
import { RUN_AGENT_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/run-agent-job-name.constant';
import { AGENT_WAIT_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/agent-wait-prompt.constant';
import { createAgentWaitTools } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/create-agent-wait-tools.util';
import { findAgentRunWait } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/find-agent-run-wait.util';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { AgentRunTurnService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-turn.service';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { addStepToAgentTurnUsage } from 'src/engine/metadata-modules/ai/ai-billing/utils/add-step-to-agent-turn-usage.util';
import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentRunnerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-outcome.type';
import { type AgentRunnerRunInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-run-input.type';
import { type AgentRunSuspension } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-suspension.type';
import { type ContinueAgentRunJobData } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/continue-agent-run-job-data.type';
import { type AgentRunCallerHandler } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-handler.type';
import { type RunAgentJobData } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/run-agent-job-data.type';
import { buildAgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-summary.util';
import { sumAgentRunSummaries } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/sum-agent-run-summaries.util';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { type AgentChatStreamClaim } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentTurnStreamService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-turn-stream.service';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { AgentConversationReaderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-reader.service';
import { withDedicatedAiTrace } from 'src/engine/metadata-modules/ai/ai-models/utils/with-dedicated-ai-trace.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const AGENT_RUN_MAX_CONTINUATIONS = 50;

const CONVERSATION_BUSY = Symbol('conversation-busy');

type AgentRunStream = {
  claim: AgentChatStreamClaim;
  abortSignal: AbortSignal;
};

type AgentRunnerResult = {
  outcome: AgentRunnerOutcome;
  // the run so far, across every segment of a continued run
  summary: AgentRunSummary;
};

@Injectable()
export class AgentRunnerService {
  private readonly logger = new Logger(AgentRunnerService.name);

  constructor(
    private readonly agentRunTurnService: AgentRunTurnService,
    private readonly agentRunConversationService: AgentRunConversationService,
    private readonly conversationReaderService: AgentConversationReaderService,
    private readonly agentRunSuspensionService: AgentRunSuspensionService,
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
    private readonly pendingWakeUpService: PendingWakeUpService,
    private readonly turnRecorderService: AgentTurnRecorderService,
    private readonly turnStreamService: AgentTurnStreamService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    @InjectMessageQueue(MessageQueue.aiQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
  ) {}

  async start(input: RunAgentJobData): Promise<void> {
    await this.messageQueueService.add<RunAgentJobData>(
      RUN_AGENT_JOB_NAME,
      input,
    );
  }

  async runStarted(jobData: RunAgentJobData): Promise<void> {
    const { workspaceId, conversation, caller } = jobData;
    const handler = this.callerHandlerRegistry.getHandlerOrThrow(caller.type);

    // a caller that stopped waiting while the run was queued, such as a stopped workflow, must not have it act
    if ((await handler.getWaitingState({ workspaceId, caller })) === 'GONE') {
      await this.deliverFailure({
        workspaceId,
        caller,
        threadId: conversation.threadId,
        error: 'The caller stopped waiting before the run started',
      });

      return;
    }

    const result = await this.runClaimedOrDeliverFailure({ jobData, handler });

    if (!isDefined(result)) {
      return;
    }

    if (result === CONVERSATION_BUSY) {
      if (await this.retryWhenFree({ jobName: RUN_AGENT_JOB_NAME, jobData })) {
        return;
      }

      await this.deliverFailure({
        workspaceId,
        caller,
        threadId: conversation.threadId,
        error: 'The conversation stayed busy',
      });

      return;
    }

    if (result.outcome.status === 'SUSPENDED') {
      await this.showSuspension({
        workspaceId,
        caller,
        threadId: conversation.threadId,
        summary: result.summary,
      });

      return;
    }

    await this.agentRunSuspensionService.deliverOutcome({
      workspaceId,
      caller,
      threadId: conversation.threadId,
      outcome: result.outcome,
      summary: result.summary,
    });
  }

  // a run that fails before it settles is delivered as failed here, so null means nothing is left to do
  private async runClaimedOrDeliverFailure({
    jobData: { workspaceId, conversation, caller, spec, prompt },
    handler,
  }: {
    jobData: RunAgentJobData;
    handler: AgentRunCallerHandler;
  }): Promise<AgentRunnerResult | typeof CONVERSATION_BUSY | null> {
    try {
      const [executionContext, agent] = await Promise.all([
        handler.buildExecutionContext({ workspaceId, caller }),
        this.findAgentOrThrow({ workspaceId, agentId: spec.agentId }),
      ]);

      return await this.withClaimedConversation({
        workspaceId,
        threadId: conversation.threadId,
        title: spec.title,
        work: (stream) =>
          workspaceAuthContextStorage.run(executionContext.authContext, () =>
            this.runTurn({
              input: {
                workspaceId,
                conversation,
                caller,
                spec,
                agent,
                prompt,
                executionContext,
              },
              suspension: null,
              stream,
            }),
          ),
      });
    } catch (error) {
      this.logger.error(
        `Agent run in thread ${conversation.threadId} of workspace ${workspaceId} failed`,
        error instanceof Error ? error.stack : error,
      );

      await this.deliverFailure({
        workspaceId,
        caller,
        threadId: conversation.threadId,
        error: error instanceof Error ? error.message : String(error),
      });

      return null;
    }
  }

  // Picks a suspended run up where it paused once its wake-up resolved, holding its conversation.
  // The wake-up is removed only once the run went on and its caller has the outcome, so a job that
  // died or failed midway finds it again, and a pause the run made again replaced it with another
  // id, so each pause goes on once
  async continue(jobData: ContinueAgentRunJobData): Promise<void> {
    const { workspaceId, threadId, wakeUpId, outcome } = jobData;
    const wakeUp = await this.pendingWakeUpService.find({
      workspaceId,
      wakeUpId,
    });

    if (!isDefined(wakeUp)) {
      return;
    }

    const suspension = wakeUp.payload as AgentRunSuspension;

    const continued = await this.withClaimedConversation({
      workspaceId,
      threadId,
      title: suspension.runSpec.title,
      work: async (stream) => {
        // a duplicate job waited for the conversation while the first one went on and claimed the wake-up
        if (
          !isDefined(
            await this.pendingWakeUpService.find({ workspaceId, wakeUpId }),
          )
        ) {
          return null;
        }

        const result = await this.continueSuspendedRun({
          workspaceId,
          threadId,
          suspension,
          isAwaitingAnswer: wakeUp.condition.type === 'ANSWER',
          outcome,
          stream,
        });

        await this.pendingWakeUpService.claim({ workspaceId, wakeUpId });

        return result;
      },
    });

    if (continued === CONVERSATION_BUSY) {
      if (
        !(await this.retryWhenFree({
          jobName: CONTINUE_AGENT_RUN_JOB_NAME,
          jobData,
        }))
      ) {
        await this.agentRunSuspensionService.settle({
          workspaceId,
          threadId,
          suspension,
          outcome: { status: 'FAILED', error: 'The conversation stayed busy' },
          isAwaitingAnswer: wakeUp.condition.type === 'ANSWER',
        });
      }

      return;
    }

    if (continued?.outcome.status === 'SUSPENDED') {
      await this.showSuspension({
        workspaceId,
        caller: suspension.caller,
        threadId,
        summary: continued.summary,
      });
    }
  }

  // shown once the run let go of its conversation, so a caller that sees it waiting can answer it
  private async showSuspension({
    workspaceId,
    caller,
    threadId,
    summary,
  }: {
    workspaceId: string;
    caller: AgentRunCaller;
    threadId: string;
    summary: AgentRunSummary;
  }): Promise<void> {
    await this.tryRecording(
      `show the caller of thread ${threadId} where its run waits`,
      async () =>
        this.callerHandlerRegistry
          .getHandlerOrThrow(caller.type)
          .onSuspended?.({ workspaceId, caller, threadId, summary }),
    );
  }

  private async withClaimedConversation<TResult>({
    workspaceId,
    threadId,
    title,
    work,
  }: {
    workspaceId: string;
    threadId: string;
    title: string;
    work: (stream: AgentRunStream) => Promise<TResult>;
  }): Promise<TResult | typeof CONVERSATION_BUSY> {
    const streamId = generateId();
    const isClaimed = await this.agentRunConversationService.claimThread({
      workspaceId,
      threadId,
      title,
      streamId,
    });

    if (!isClaimed) {
      return CONVERSATION_BUSY;
    }

    const claim = { workspaceId, threadId, streamId };

    return this.turnStreamService.runClaimed({
      claim,
      work: (abortSignal) => work({ claim, abortSignal }),
    });
  }

  private async retryWhenFree<TJobData extends { busyAttempt?: number }>({
    jobName,
    jobData,
  }: {
    jobName: string;
    jobData: TJobData;
  }): Promise<boolean> {
    const busyAttempt = (jobData.busyAttempt ?? 0) + 1;

    // a run holding the conversation for longer than a runAgent call waits on it is taken as stuck
    if (busyAttempt * AGENT_RUN_BUSY_RETRY_DELAY_MS >= RUN_AGENT_MAX_WAIT_MS) {
      return false;
    }

    await this.messageQueueService.add<TJobData>(
      jobName,
      { ...jobData, busyAttempt },
      { delay: AGENT_RUN_BUSY_RETRY_DELAY_MS },
    );

    return true;
  }

  private async deliverFailure({
    workspaceId,
    caller,
    threadId,
    error,
  }: {
    workspaceId: string;
    caller: AgentRunCaller;
    threadId: string;
    error: string;
  }): Promise<void> {
    await this.agentRunSuspensionService.deliverOutcome({
      workspaceId,
      caller,
      threadId,
      outcome: { status: 'FAILED', error },
      summary: null,
    });
  }

  private async continueSuspendedRun({
    workspaceId,
    threadId,
    suspension,
    isAwaitingAnswer,
    outcome,
    stream,
  }: Omit<ContinueAgentRunJobData, 'wakeUpId'> & {
    suspension: AgentRunSuspension;
    isAwaitingAnswer: boolean;
    stream: AgentRunStream;
  }): Promise<AgentRunnerResult | null> {
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
          streamId: stream.claim.streamId,
        });

        return null;
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

      if (outcome.type === 'MESSAGE_RECEIVED' && isAwaitingAnswer) {
        // a member who writes instead of answering moves on from the question, as in chat
        await this.agentRunSuspensionService.closePendingQuestion({
          workspaceId,
          threadId,
          streamId: stream.claim.streamId,
          turnStatus: AgentTurnStatus.COMPLETED,
        });
      }

      const [agent, executionContext] = await Promise.all([
        this.findAgentOrThrow({ workspaceId, agentId: runSpec.agentId }),
        handler.buildExecutionContext({ workspaceId, caller }),
      ]);

      result = await workspaceAuthContextStorage.run(
        executionContext.authContext,
        () =>
          this.runTurn({
            input: {
              workspaceId,
              conversation: { threadId, isCreated: false },
              caller,
              spec: runSpec,
              agent,
              prompt: null,
              executionContext,
            },
            suspension,
            stream,
          }),
      );
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
        streamId: stream.claim.streamId,
      });
      // handled here instead of thrown, so the interrupted turn is failed here as a thrown error would be
      await this.turnStreamService.failStream({ claim: stream.claim, error });

      return null;
    }

    if (result.outcome.status !== 'SUSPENDED') {
      await this.agentRunSuspensionService.settle({
        workspaceId,
        threadId,
        suspension,
        outcome: result.outcome,
        summary: result.summary,
        streamId: stream.claim.streamId,
      });
    }

    return result;
  }

  private async runTurn({
    input,
    suspension,
    stream: { claim, abortSignal },
  }: {
    input: AgentRunnerRunInput;
    // what a continued run resumes from
    suspension: AgentRunSuspension | null;
    stream: AgentRunStream;
  }): Promise<AgentRunnerResult> {
    const {
      workspaceId,
      conversation: { threadId, isCreated },
      spec,
      agent,
      prompt,
      executionContext,
    } = input;

    if (!isCreated && !isDefined(suspension)) {
      await this.agentRunSuspensionService.assertConversationNotSuspended({
        workspaceId,
        threadId,
      });
    }

    const { turnId, promptMessageIds, hasTakenQueuedMessages } =
      await this.agentRunConversationService.openTurn({
        workspaceId,
        threadId,
        agentId: agent.id,
        senderUserWorkspaceId: prompt?.senderUserWorkspaceId ?? null,
        senderApplicationId: prompt?.senderApplicationId ?? null,
        createdBy: executionContext.turnCreatedBy,
        messages: prompt?.messages ?? [],
      });

    if (hasTakenQueuedMessages) {
      await this.eventPublisherService.publish({
        workspaceId,
        threadId,
        event: { type: 'queue-updated' },
      });
    }

    // read once the turn is open, so it holds the messages the turn took, while its prompt goes to the model as is
    const conversationMessages =
      await this.conversationReaderService.loadMessages({
        workspaceId,
        threadId,
        actor: executionContext.conversationActor,
      });
    const priorMessages = conversationMessages.filter(
      ({ id }) => !promptMessageIds.includes(id),
    );

    const startedAtMs = Date.now();
    const turnInput = {
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
      responseFormat: spec.responseFormat ?? agent.responseFormat,
      workspaceId,
      executionContext,
      additionalExcludedToolNames: spec.additionalExcludedToolNames,
      toolLoadingStrategy: spec.toolLoadingStrategy,
      abortSignal,
    };

    // the toolset and prompt come from the spec alone, so a continued run gets those it paused with
    const streamed = await withDedicatedAiTrace(() =>
      this.turnStreamService.stream({
        claim,
        turnId,
        startTurn: () => this.agentRunTurnService.startTurn(turnInput),
      }),
    );

    // a turn that fails keeps the usage of the steps it finished, as billing does
    const recordStreamedUsage = () =>
      this.turnRecorderService.recordUsage({
        workspaceId,
        threadId,
        turnId,
        usage: streamed.usage,
      });

    if (isDefined(streamed.streamError)) {
      await recordStreamedUsage();

      throw streamed.streamError;
    }

    const execution = await this.agentRunTurnService
      .completeTurn({ ...turnInput, started: streamed.started })
      .catch(async (error: unknown) => {
        await recordStreamedUsage();

        throw error;
      });

    const wait = execution.isPaused
      ? findAgentRunWait(
          execution.steps[execution.steps.length - 1]?.toolResults ?? [],
        )
      : undefined;

    const finished = await this.turnStreamService.finishTurn({
      claim,
      turnId,
      result: {
        ...streamed,
        usage: execution.structuredOutputSteps.reduce(
          (usage, step) => ({
            ...usage,
            ...addStepToAgentTurnUsage(
              streamed.started.source.modelConfig,
              usage,
              step,
            ),
          }),
          streamed.usage,
        ),
      },
      modelId: execution.modelId,
      stopReason: execution.stopReason,
      isWaiting: isDefined(wait),
      isBackgroundRun: true,
    });

    await this.turnStreamService.publishTurnEnd({
      claim,
      assistantMessageId: streamed.assistantMessageId,
      stopReason: execution.stopReason,
    });

    const summary = sumAgentRunSummaries({
      previousSummary: suspension?.summary ?? null,
      nextSummary: buildAgentRunSummary({
        execution,
        durationMs: Date.now() - startedAtMs,
      }),
    });

    return {
      summary,
      // a stop can also land while the structured output is asked for, after the stream ended
      outcome:
        streamed.isAborted || abortSignal.aborted
          ? { status: 'FAILED', error: 'The run was stopped' }
          : await this.settleTurn({
              input,
              execution,
              wait,
              isAwaitingAnswer: finished?.isAwaitingAnswer ?? false,
              summary,
              suspension,
              streamId: claim.streamId,
            }),
    };
  }

  private async settleTurn({
    input: { workspaceId, conversation, caller, spec },
    execution,
    wait,
    isAwaitingAnswer,
    summary,
    suspension,
    streamId,
  }: {
    input: AgentRunnerRunInput;
    execution: AgentExecutionResult;
    wait: ReturnType<typeof findAgentRunWait>;
    isAwaitingAnswer: boolean;
    summary: AgentRunSummary;
    suspension: AgentRunSuspension | null;
    streamId: string;
  }): Promise<AgentRunnerOutcome> {
    if (!isDefined(execution.stopReason) && !execution.isPaused) {
      return { status: 'COMPLETED', result: execution.result };
    }

    const { threadId } = conversation;
    const continuationCount = isDefined(suspension)
      ? suspension.continuationCount + 1
      : 0;
    const hasPausedTooOften = continuationCount >= AGENT_RUN_MAX_CONTINUATIONS;
    // a run waits on the questions it asked rather than on a wait it called alongside them
    const condition: PendingWakeUpCondition | undefined = isAwaitingAnswer
      ? { type: 'ANSWER', threadId }
      : wait?.condition;

    // A failure to suspend only fails the run, like a pause that could not be recorded
    const isSuspended =
      !isDefined(execution.stopReason) &&
      !hasPausedTooOften &&
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
      isAwaitingAnswer,
      streamId,
    });

    if (isDefined(execution.stopReason)) {
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

    return {
      status: 'FAILED',
      error: isDefined(wait)
        ? 'Agent paused to wait but its conversation could not be recorded.'
        : 'Agent asked a question that could not be recorded.',
    };
  }

  private async findAgentOrThrow({
    workspaceId,
    agentId,
  }: {
    workspaceId: string;
    agentId: string;
  }): Promise<AgentEntity> {
    const agent = await this.agentRepository.findOne(workspaceId, {
      where: { id: agentId },
    });

    if (!isDefined(agent)) {
      throw new AiException(
        `Agent with id ${agentId} not found`,
        AiExceptionCode.AGENT_NOT_FOUND,
      );
    }

    return agent;
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
