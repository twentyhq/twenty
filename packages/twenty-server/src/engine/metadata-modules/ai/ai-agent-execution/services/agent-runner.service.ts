import { Inject, Injectable, Logger } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { generateId } from 'ai';
import {
  type AgentChatSubscriptionEvent,
  type AgentRunSummary,
  type ExtendedUIMessage,
} from 'twenty-shared/ai';
import { type PendingWakeUpCondition } from 'twenty-shared/pending-wake-up';
import {
  assertIsDefinedOrThrow,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { CONTINUE_AGENT_RUN_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/continue-agent-run-job-name.constant';
import { RUN_AGENT_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/run-agent-job-name.constant';
import { AGENT_WAIT_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/agent-wait-prompt.constant';
import { createAgentWaitTools } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/create-agent-wait-tools.util';
import { findAgentRunWait } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/find-agent-run-wait.util';
import { findAwaitingPausingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-awaiting-pausing-tool-parts.util';
import { AGENT_RUN_STOPPED_ERROR } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-stopped-error.constant';
import { AGENT_RUN_OUT_OF_CREDITS_ERROR } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-out-of-credits-error.const';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunPersonaService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-persona.service';
import { AgentRunJobScopeService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-job-scope.service';
import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { AgentRunTurnService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-turn.service';
import { AGENT_TURN_INTERRUPTED_ERROR } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-turn-interrupted-error.constant';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { getAgentHistoryRepositoryToken } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { addStepToAgentTurnUsage } from 'src/engine/metadata-modules/ai/ai-billing/utils/add-step-to-agent-turn-usage.util';
import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentRunnerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-outcome.type';
import { type AgentRunnerRunInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-run-input.type';
import { type InRequestAgentRun } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/in-request-agent-run.type';
import { type AgentRunSuspension } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-suspension.type';
import { type AgentRunContinuationCompletion } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-continuation-completion.type';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { type ResolvedAgentRunPersona } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-agent-run-persona.type';
import { type ContinueAgentRunJobData } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/continue-agent-run-job-data.type';
import { type AgentRunCallerHandler } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-handler.type';
import { type RunAgentJobData } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/run-agent-job-data.type';
import { buildAgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-summary.util';
import { sumAgentRunSummaries } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/sum-agent-run-summaries.util';
import { buildAgentRunContinuationTurnId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-continuation-turn-id.util';
import { canRecoverAgentRunContinuationCompletion } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/can-recover-agent-run-continuation-completion.util';
import { readAgentRunSuspensionOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/read-agent-run-suspension-or-throw.util';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatReplyContinuationPolicyService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-reply-continuation-policy.service';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import {
  type AgentChatStreamClaim,
  AgentChatStreamRecoveryService,
} from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { AgentChatWaitingRunService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-waiting-run.service';
import {
  type AgentTurnStreamResult,
  AgentTurnStreamService,
} from 'src/engine/metadata-modules/ai/ai-chat/services/agent-turn-stream.service';
import { mapErrorToStreamError } from 'src/engine/metadata-modules/ai/ai-history/utils/map-error-to-stream-error.util';
import { AgentConversationReaderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-reader.service';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { withDedicatedAiTrace } from 'src/engine/metadata-modules/ai/ai-models/utils/with-dedicated-ai-trace.util';

const AGENT_RUN_MAX_CONTINUATIONS = 50;

const CONVERSATION_BUSY = Symbol('conversation-busy');
const CONTINUATION_INPUT_REJECTED = Symbol('continuation-input-rejected');

type RunContinuation = {
  turnId: string;
  wakeUpId: string;
  queuedMessageIds: string[];
  requiresQueuedMessages: boolean;
};

type PreparedRunContinuation = {
  turnId: string;
  wakeUpId: string;
  persona: ResolvedAgentRunPersona;
  executionContext: AgentRunExecutionContext;
};

type AgentRunStream = {
  claim: AgentChatStreamClaim;
  abortSignal: AbortSignal;
};

type AgentRunnerResult = {
  outcome: AgentRunnerOutcome;
  // the run so far, across every segment of a continued run
  summary: AgentRunSummary;
  continuationCompletion?: AgentRunContinuationCompletion;
};

type OpenedAgentRunTurn = {
  turnId: string;
  priorMessages: ExtendedUIMessage[];
};

@Injectable()
export class AgentRunnerService {
  private readonly logger = new Logger(AgentRunnerService.name);

  @Inject(AgentChatReplyContinuationPolicyService)
  private readonly replyContinuationPolicyService: AgentChatReplyContinuationPolicyService;

  @Inject(getAgentHistoryRepositoryToken('agentChatThread'))
  private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>;

  constructor(
    private readonly agentRunTurnService: AgentRunTurnService,
    private readonly agentRunConversationService: AgentRunConversationService,
    private readonly conversationReaderService: AgentConversationReaderService,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly agentRunSuspensionService: AgentRunSuspensionService,
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
    private readonly pendingWakeUpService: PendingWakeUpService,
    private readonly turnStreamService: AgentTurnStreamService,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly waitingRunService: AgentChatWaitingRunService,
    private readonly agentRunJobScopeService: AgentRunJobScopeService,
    @InjectMessageQueue(MessageQueue.aiQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly agentRunPersonaService: AgentRunPersonaService,
    private readonly turnRecorderService: AgentTurnRecorderService,
  ) {}

  async start(input: RunAgentJobData): Promise<void> {
    await this.messageQueueService.add<RunAgentJobData>(
      RUN_AGENT_JOB_NAME,
      { ...input, turnId: input.turnId ?? randomUUID() },
      await this.agentRunJobScopeService.resolve({
        workspaceId: input.workspaceId,
        spec: input.spec,
      }),
    );
  }

  // a failure after the turn is recorded comes back as the outcome, so the caller still gets the run id
  async runInRequest({
    streamChannelId,
    ...input
  }: Omit<AgentRunnerRunInput, 'conversation' | 'caller' | 'persona'> & {
    streamChannelId?: string;
  }): Promise<InRequestAgentRun> {
    const persona = await this.agentRunPersonaService.resolveOrThrow({
      workspaceId: input.workspaceId,
      spec: input.spec,
    });
    const runInput: AgentRunnerRunInput = {
      ...input,
      conversation: null,
      caller: null,
      persona,
    };

    return workspaceAuthContextStorage.run(
      input.executionContext.authContext,
      async () => {
        const openedTurn = await this.openTurn({
          input: runInput,
          suspension: null,
        });
        const { turnId } = openedTurn;
        const outcome = await this.runOpenedTurn({
          input: runInput,
          suspension: null,
          stream: null,
          streamChannelId,
          openedTurn,
        }).then(
          (result): AgentRunnerOutcome => result.outcome,
          (error: unknown): AgentRunnerOutcome => {
            this.logger.error(
              `Agent run ${turnId} of workspace ${input.workspaceId} failed`,
              error instanceof Error ? error.stack : error,
            );

            return {
              status: 'FAILED',
              error: error instanceof Error ? error.message : String(error),
            };
          },
        );

        return {
          runId: turnId,
          outcome,
          usage: await this.turnRecorderService.findUsageOrThrow({
            workspaceId: input.workspaceId,
            turnId,
          }),
        };
      },
    );
  }

  async runStarted(jobData: RunAgentJobData): Promise<void> {
    const { workspaceId, conversation, caller, parkId } = jobData;
    const threadId = conversation?.threadId ?? null;

    if (
      isDefined(threadId) &&
      !(await this.waitingRunService.shouldRunLegacyParkedCopy({
        threadId,
        parkId,
      }))
    ) {
      return;
    }

    const handler = this.callerHandlerRegistry.getHandlerOrThrow(caller.type);

    // a caller that stopped waiting while the run was queued, such as a stopped workflow, must not have it act
    if ((await handler.getWaitingState({ workspaceId, caller })) === 'GONE') {
      await this.agentRunSuspensionService.deliverOutcome({
        workspaceId,
        caller,
        threadId,
        outcome: {
          status: 'FAILED',
          error: 'The caller stopped waiting before the run started',
        },
        summary: null,
      });

      return;
    }

    const result = await this.runOrDeliverFailure({ jobData, handler });

    if (!isDefined(result)) {
      return;
    }

    if (result !== CONVERSATION_BUSY && result.outcome.status !== 'SUSPENDED') {
      await this.agentRunSuspensionService.deliverOutcome({
        workspaceId,
        caller,
        threadId,
        outcome: result.outcome,
        summary: result.summary,
      });

      return;
    }

    // only a run holding a conversation finds it busy or pauses in it
    if (!isDefined(threadId)) {
      return;
    }

    if (result === CONVERSATION_BUSY) {
      await this.waitingRunService.wait({
        workspaceId,
        threadId,
        run: {
          jobName: RUN_AGENT_JOB_NAME,
          jobData: { ...jobData, parkId: undefined },
          scope: await this.agentRunJobScopeService.resolve({
            workspaceId,
            spec: jobData.spec,
          }),
        },
      });

      return;
    }

    await this.showSuspension({
      workspaceId,
      caller,
      threadId,
      summary: result.summary,
    });
  }

  // a run that fails before it settles is delivered as failed here, so null means nothing is left to do
  private async runOrDeliverFailure({
    jobData: { workspaceId, conversation, turnId, caller, spec, prompt },
    handler,
  }: {
    jobData: RunAgentJobData;
    handler: AgentRunCallerHandler;
  }): Promise<AgentRunnerResult | typeof CONVERSATION_BUSY | null> {
    try {
      const [executionContext, persona] = await Promise.all([
        handler.buildExecutionContext({ workspaceId, caller }),
        this.agentRunPersonaService.resolveOrThrow({ workspaceId, spec }),
      ]);
      const run = async (
        stream: AgentRunStream | null,
      ): Promise<AgentRunnerResult | null> => {
        const retriedTurn = isDefined(turnId)
          ? await this.turnRecorderService.findTurn({ workspaceId, turnId })
          : null;

        // a stalled job's retry must not act twice; a waiting run goes on through its wake-up
        if (isDefined(retriedTurn)) {
          if (retriedTurn.status === AgentTurnStatus.RUNNING) {
            await this.turnRecorderService.finish({
              workspaceId,
              turnId: retriedTurn.id,
              status: AgentTurnStatus.FAILED,
              error: AGENT_TURN_INTERRUPTED_ERROR,
            });
          }

          if (retriedTurn.status !== AgentTurnStatus.WAITING_FOR_INPUT) {
            await this.agentRunSuspensionService.deliverOutcome({
              workspaceId,
              caller,
              threadId: conversation?.threadId ?? null,
              outcome: {
                status: 'FAILED',
                error: AGENT_TURN_INTERRUPTED_ERROR.message,
              },
              summary: null,
            });
          }

          return null;
        }

        return workspaceAuthContextStorage.run(
          executionContext.authContext,
          () =>
            this.runTurn({
              input: {
                workspaceId,
                conversation,
                turnId,
                caller,
                spec,
                persona,
                prompt,
                executionContext,
              },
              suspension: null,
              stream,
            }),
        );
      };

      return isDefined(conversation)
        ? await this.withClaimedConversation({
            workspaceId,
            threadId: conversation.threadId,
            title: spec.title,
            work: run,
          })
        : await run(null);
    } catch (error) {
      this.logger.error(
        `Agent run in thread ${conversation?.threadId ?? 'none'} of workspace ${workspaceId} failed`,
        error instanceof Error ? error.stack : error,
      );

      await this.agentRunSuspensionService.deliverOutcome({
        workspaceId,
        caller,
        threadId: conversation?.threadId ?? null,
        outcome: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : String(error),
        },
        summary: null,
      });

      return null;
    }
  }

  // Picks a suspended run up where it paused once its wake-up resolved, holding its conversation.
  // The wake-up is removed only once the run went on and its caller has the outcome, so a job that
  // died or failed midway finds it again, and a pause the run made again replaced it with another
  // id, so each pause goes on once
  async continue(jobData: ContinueAgentRunJobData): Promise<void> {
    const { workspaceId, threadId, wakeUpId, outcome, parkId } = jobData;

    if (
      !(await this.waitingRunService.shouldRunLegacyParkedCopy({
        threadId,
        parkId,
      }))
    ) {
      return;
    }

    const wakeUp = await this.pendingWakeUpService.find({
      workspaceId,
      wakeUpId,
    });

    if (!isDefined(wakeUp)) {
      return;
    }

    const suspension = readAgentRunSuspensionOrThrow(wakeUp.payload);

    const continued = await this.withClaimedConversation({
      workspaceId,
      threadId,
      title: suspension.runSpec.title,
      work: async (stream) => {
        // a duplicate job waited for the conversation while the first one went on and claimed the wake-up
        const currentWakeUp = await this.pendingWakeUpService.find({
          workspaceId,
          wakeUpId,
        });

        if (!isDefined(currentWakeUp)) {
          return null;
        }

        const currentSuspension = readAgentRunSuspensionOrThrow(
          currentWakeUp.payload,
        );
        const turnId = buildAgentRunContinuationTurnId(wakeUpId);
        const recoveredContinuation = await this.recoverContinuation({
          workspaceId,
          threadId,
          turnId,
          wakeUpId,
          suspension: currentSuspension,
          isAwaitingAnswer: currentWakeUp.condition.type === 'ANSWER',
          stream,
        });

        if (!isUndefined(recoveredContinuation)) {
          return recoveredContinuation;
        }

        const continuation = await this.findContinuation({
          workspaceId,
          threadId,
          turnId,
          wakeUpId,
          outcomeType: outcome.type,
        });
        const result = await this.continueSuspendedRun({
          workspaceId,
          threadId,
          suspension: currentSuspension,
          isAwaitingAnswer: currentWakeUp.condition.type === 'ANSWER',
          outcome,
          stream,
          continuation,
        });

        if (result === CONTINUATION_INPUT_REJECTED) {
          await this.publishContinuationEvent({
            workspaceId,
            threadId,
            event: { type: 'stream-ended' },
          });

          return null;
        }

        await this.pendingWakeUpService.claim({ workspaceId, wakeUpId });

        return result;
      },
    });

    if (continued === CONVERSATION_BUSY) {
      await this.waitingRunService.wait({
        workspaceId,
        threadId,
        run: {
          jobName: CONTINUE_AGENT_RUN_JOB_NAME,
          jobData: { ...jobData, parkId: undefined },
          scope: await this.agentRunJobScopeService.resolve({
            workspaceId,
            spec: suspension.runSpec,
          }),
        },
      });

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

  private async findContinuation({
    workspaceId,
    threadId,
    turnId,
    wakeUpId,
    outcomeType,
  }: {
    workspaceId: string;
    threadId: string;
    turnId: string;
    wakeUpId: string;
    outcomeType: ContinueAgentRunJobData['outcome']['type'];
  }): Promise<RunContinuation | typeof CONTINUATION_INPUT_REJECTED> {
    const queuedMessageIds =
      await this.replyContinuationPolicyService.findAllowedQueuedMessageIds({
        workspaceId,
        threadId,
      });

    const requiresQueuedMessages = outcomeType === 'MESSAGE_RECEIVED';

    if (requiresQueuedMessages && !isNonEmptyArray(queuedMessageIds)) {
      return CONTINUATION_INPUT_REJECTED;
    }

    return { turnId, wakeUpId, queuedMessageIds, requiresQueuedMessages };
  }

  private async recoverContinuation({
    workspaceId,
    threadId,
    turnId,
    wakeUpId,
    suspension,
    isAwaitingAnswer,
    stream,
  }: {
    workspaceId: string;
    threadId: string;
    turnId: string;
    wakeUpId: string;
    suspension: AgentRunSuspension;
    isAwaitingAnswer: boolean;
    stream: AgentRunStream;
  }): Promise<AgentRunnerResult | null | undefined> {
    const turn = await this.turnRecorderService.findTurn({
      workspaceId,
      turnId,
    });

    if (!isDefined(turn)) {
      return undefined;
    }

    const completion = suspension.continuationCompletion;
    const canRecoverCompletion = canRecoverAgentRunContinuationCompletion({
      turn,
      completion,
    });
    const result =
      canRecoverCompletion && isDefined(completion)
        ? await this.recoverCompletedContinuation({
            workspaceId,
            threadId,
            wakeUpId,
            suspension,
            completion,
            stream,
          })
        : null;

    if (!canRecoverCompletion) {
      await this.settleInterruptedContinuation({
        workspaceId,
        threadId,
        turnId,
        turnStatus: turn.status,
        suspension,
        isAwaitingAnswer,
        stream,
      });
    }

    await this.pendingWakeUpService.claim({ workspaceId, wakeUpId });
    await this.publishContinuationEvent({
      workspaceId,
      threadId,
      event: { type: 'stream-ended' },
    });

    return result;
  }

  private async settleInterruptedContinuation({
    workspaceId,
    threadId,
    turnId,
    turnStatus,
    suspension,
    isAwaitingAnswer,
    stream,
  }: {
    workspaceId: string;
    threadId: string;
    turnId: string;
    turnStatus: AgentTurnStatus;
    suspension: AgentRunSuspension;
    isAwaitingAnswer: boolean;
    stream: AgentRunStream;
  }): Promise<void> {
    if (turnStatus === AgentTurnStatus.RUNNING) {
      await this.turnRecorderService.finish({
        workspaceId,
        turnId,
        status: AgentTurnStatus.FAILED,
        error: AGENT_TURN_INTERRUPTED_ERROR,
      });
    }

    await this.agentRunSuspensionService.settle({
      workspaceId,
      threadId,
      suspension,
      outcome: {
        status: 'FAILED',
        error: AGENT_TURN_INTERRUPTED_ERROR.message,
      },
      isAwaitingAnswer,
      streamId: stream.claim.streamId,
    });
  }

  private async recoverCompletedContinuation({
    workspaceId,
    threadId,
    wakeUpId,
    suspension,
    completion,
    stream,
  }: {
    workspaceId: string;
    threadId: string;
    wakeUpId: string;
    suspension: AgentRunSuspension;
    completion: AgentRunContinuationCompletion;
    stream: AgentRunStream;
  }): Promise<AgentRunnerResult> {
    const hasAnsweredQuestion =
      completion.isAwaitingAnswer &&
      (!isDefined(completion.questionMessageId) ||
        !(await this.threadRepository.existsBy(workspaceId, {
          id: threadId,
          pendingQuestionMessageId: completion.questionMessageId,
        })));
    const answeredQuestionOutcome: AgentRunnerOutcome | undefined =
      hasAnsweredQuestion && !isDefined(completion.execution.stopReason)
        ? { status: 'FAILED', error: AGENT_TURN_INTERRUPTED_ERROR.message }
        : undefined;
    const abortedOutcome: AgentRunnerOutcome | undefined = completion.isAborted
      ? { status: 'FAILED', error: AGENT_RUN_STOPPED_ERROR }
      : undefined;
    const outcome =
      completion.settledOutcome ??
      abortedOutcome ??
      answeredQuestionOutcome ??
      (await this.settleTurn({
        input: {
          workspaceId,
          caller: suspension.caller,
          spec: suspension.runSpec,
        },
        execution: completion.execution,
        wait: isDefined(completion.waitCondition)
          ? { condition: completion.waitCondition }
          : undefined,
        isAwaitingAnswer: completion.isAwaitingAnswer && !hasAnsweredQuestion,
        summary: completion.summary,
        suspension,
        stream,
      }));

    await this.pendingWakeUpService.updatePayload({
      workspaceId,
      wakeUpId,
      payload: {
        ...suspension,
        continuationCompletion: { ...completion, settledOutcome: outcome },
      },
    });

    if (outcome.status !== 'SUSPENDED') {
      await this.agentRunSuspensionService.settle({
        workspaceId,
        threadId,
        suspension,
        outcome,
        summary: completion.summary,
        isAwaitingAnswer: completion.isAwaitingAnswer && !hasAnsweredQuestion,
        streamId: stream.claim.streamId,
      });
    }

    return { outcome, summary: completion.summary };
  }
  private async publishContinuationEvent({
    workspaceId,
    threadId,
    event,
  }: {
    workspaceId: string;
    threadId: string;
    event: AgentChatSubscriptionEvent;
  }): Promise<void> {
    await this.eventPublisherService
      .publish({ workspaceId, threadId, event })
      .catch((error: unknown) =>
        this.logger.warn(
          `Could not publish ${event.type} for workspace ${workspaceId}, thread ${threadId}: ${formatErrorWithCause(error)}`,
        ),
      );
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

  private async continueSuspendedRun({
    workspaceId,
    threadId,
    suspension,
    isAwaitingAnswer,
    outcome,
    stream,
    continuation,
  }: Omit<ContinueAgentRunJobData, 'wakeUpId'> & {
    suspension: AgentRunSuspension;
    isAwaitingAnswer: boolean;
    stream: AgentRunStream;
    continuation: RunContinuation | typeof CONTINUATION_INPUT_REJECTED;
  }): Promise<AgentRunnerResult | typeof CONTINUATION_INPUT_REJECTED | null> {
    if (continuation === CONTINUATION_INPUT_REJECTED) {
      return CONTINUATION_INPUT_REJECTED;
    }

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

      const preparedContinuation = await this.prepareContinuation({
        workspaceId,
        threadId,
        caller,
        runSpec,
        continuation,
      });

      if (preparedContinuation === CONTINUATION_INPUT_REJECTED) {
        return CONTINUATION_INPUT_REJECTED;
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

      const { persona, executionContext } = preparedContinuation;

      result = await workspaceAuthContextStorage.run(
        executionContext.authContext,
        () =>
          this.runTurn({
            input: {
              workspaceId,
              conversation: { threadId, isCreated: false },
              caller,
              spec: runSpec,
              persona,
              prompt: null,
              executionContext,
            },
            suspension,
            stream,
            openedTurnId: preparedContinuation.turnId,
            continuationWakeUpId: preparedContinuation.wakeUpId,
          }),
      );
    } catch (error) {
      if (
        await this.hasRecoverableContinuationCompletion({
          workspaceId,
          wakeUpId: continuation.wakeUpId,
          turnId: continuation.turnId,
        })
      ) {
        throw error;
      }

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
      await this.streamRecoveryService.release({
        ...stream.claim,
        turnError: mapErrorToStreamError(error),
        shouldFlush: true,
      });

      return null;
    }

    if (isDefined(result.continuationCompletion)) {
      await this.pendingWakeUpService.updatePayload({
        workspaceId,
        wakeUpId: continuation.wakeUpId,
        payload: {
          ...suspension,
          continuationCompletion: {
            ...result.continuationCompletion,
            settledOutcome: result.outcome,
          },
        },
      });
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

  private async hasRecoverableContinuationCompletion({
    workspaceId,
    wakeUpId,
    turnId,
  }: {
    workspaceId: string;
    wakeUpId: string;
    turnId: string;
  }): Promise<boolean> {
    const wakeUp = await this.pendingWakeUpService.find({
      workspaceId,
      wakeUpId,
    });

    if (!isDefined(wakeUp)) {
      return true;
    }

    const turn = await this.turnRecorderService.findTurn({
      workspaceId,
      turnId,
    });

    return (
      isDefined(turn) &&
      canRecoverAgentRunContinuationCompletion({
        turn,
        completion: readAgentRunSuspensionOrThrow(wakeUp.payload)
          .continuationCompletion,
      })
    );
  }

  private async prepareContinuation({
    workspaceId,
    threadId,
    caller,
    runSpec,
    continuation: {
      turnId,
      wakeUpId,
      queuedMessageIds,
      requiresQueuedMessages,
    },
  }: Pick<AgentRunSuspension, 'caller' | 'runSpec'> & {
    workspaceId: string;
    threadId: string;
    continuation: RunContinuation;
  }): Promise<PreparedRunContinuation | typeof CONTINUATION_INPUT_REJECTED> {
    const execution = await this.resolveContinuationExecution({
      workspaceId,
      caller,
      runSpec,
    });
    const openedTurn = await this.agentRunConversationService.openTurn({
      workspaceId,
      threadId,
      turnId,
      queuedMessageIds,
      requiresQueuedMessages,
      agentId: execution.persona.agentId,
      createdBy: execution.executionContext.turnCreatedBy,
      senderUserWorkspaceId: null,
      senderApplicationId: null,
      messages: [],
    });

    if (!isDefined(openedTurn)) {
      return CONTINUATION_INPUT_REJECTED;
    }

    if (openedTurn.hasTakenQueuedMessages) {
      await this.publishContinuationEvent({
        workspaceId,
        threadId,
        event: { type: 'queue-updated' },
      });
    }

    return { ...execution, turnId: openedTurn.turnId, wakeUpId };
  }

  private async resolveContinuationExecution({
    workspaceId,
    caller,
    runSpec,
  }: Pick<AgentRunSuspension, 'caller' | 'runSpec'> & {
    workspaceId: string;
  }): Promise<Pick<PreparedRunContinuation, 'persona' | 'executionContext'>> {
    const [persona, executionContext] = await Promise.all([
      this.agentRunPersonaService.resolveOrThrow({
        workspaceId,
        spec: runSpec,
      }),
      this.callerHandlerRegistry
        .getHandlerOrThrow(caller.type)
        .buildExecutionContext({ workspaceId, caller }),
    ]);

    return { persona, executionContext };
  }

  private async runTurn({
    input,
    suspension,
    stream,
    openedTurnId,
    continuationWakeUpId,
  }: {
    input: AgentRunnerRunInput;
    // what a continued run resumes from
    suspension: AgentRunSuspension | null;
    // null for a run without a conversation, which streams to no one
    stream: AgentRunStream | null;
    openedTurnId?: string;
    continuationWakeUpId?: string;
  }): Promise<AgentRunnerResult> {
    if (isDefined(openedTurnId)) {
      assertIsDefinedOrThrow(stream);

      return this.runOpenedTurn({
        input,
        suspension,
        stream,
        continuationWakeUpId,
        openedTurn: {
          turnId: openedTurnId,
          priorMessages: await this.conversationReaderService.loadMessages({
            workspaceId: input.workspaceId,
            threadId: stream.claim.threadId,
            viewer: input.executionContext.conversationViewer,
          }),
        },
      });
    }

    return this.runOpenedTurn({
      input,
      suspension,
      stream,
      openedTurn: await this.openTurn({ input, suspension }),
    });
  }

  private async runOpenedTurn({
    input,
    suspension,
    stream,
    streamChannelId,
    continuationWakeUpId,
    openedTurn: { turnId, priorMessages },
  }: {
    input: AgentRunnerRunInput;
    suspension: AgentRunSuspension | null;
    stream: AgentRunStream | null;
    streamChannelId?: string;
    continuationWakeUpId?: string;
    openedTurn: OpenedAgentRunTurn;
  }): Promise<AgentRunnerResult> {
    const { workspaceId, spec, persona, prompt, executionContext } = input;
    const abortSignal = stream?.abortSignal;
    const canPause = isDefined(stream);

    const startedAtMs = Date.now();
    const turnInput = {
      persona,
      messages: prompt?.messages ?? [],
      priorMessages,
      // every run here goes on in the background, unlike a chat, so it can wait. The wait tools are
      // the engine's, so it explains them; the caller's own instructions come last
      baseSystemPrompt: [
        spec.baseSystemPrompt,
        ...(canPause ? [AGENT_WAIT_PROMPT] : []),
        ...(isNonEmptyString(spec.instructions) ? [spec.instructions] : []),
      ].join('\n\n'),
      pausingTools: canPause ? createAgentWaitTools() : {},
      canAskHumans: canPause && spec.capabilities.canAskHumans,
      responseFormat:
        spec.responseFormat ?? persona.responseFormat ?? undefined,
      workspaceId,
      executionContext,
      additionalExcludedToolNames: spec.additionalExcludedToolNames,
      toolLoadingStrategy: spec.toolLoadingStrategy,
      abortSignal,
    };

    // the toolset and prompt come from the spec alone, so a continued run gets those it paused with
    const {
      completion: { execution, wait, isAborted, continuationCompletion },
      finish,
    } = await withDedicatedAiTrace(() =>
      this.turnStreamService.streamTurn({
        workspaceId,
        claim: stream?.claim ?? null,
        streamChannelId,
        turnId,
        agentId: persona.agentId,
        abortSignal,
        startTurn: () => this.agentRunTurnService.startTurn(turnInput),
        completeTurn: async (streamed) => {
          if (isDefined(streamed.streamError)) {
            throw streamed.streamError;
          }

          const execution = await this.agentRunTurnService.completeTurn({
            ...turnInput,
            started: streamed.started,
          });
          const wait = execution.isPaused
            ? findAgentRunWait(
                execution.steps[execution.steps.length - 1]?.toolResults ?? [],
              )
            : undefined;
          // a stop can land after the stream ended; read once so the turn and its caller agree
          const isAborted = streamed.isAborted || abortSignal?.aborted === true;
          const continuationCompletion =
            await this.recordContinuationCompletion({
              workspaceId,
              wakeUpId: continuationWakeUpId,
              suspension,
              turnId,
              execution,
              startedAtMs,
              streamed,
              waitCondition: wait?.condition ?? null,
              isAborted,
            });

          return {
            execution,
            wait,
            isAborted,
            continuationCompletion,
            modelId: execution.modelId,
            stopReason: execution.stopReason,
            isWaiting: isDefined(wait),
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
          };
        },
        isBackgroundRun: true,
      }),
    );

    const summary =
      continuationCompletion?.summary ??
      sumAgentRunSummaries({
        previousSummary: suspension?.summary ?? null,
        nextSummary: buildAgentRunSummary({
          execution,
          durationMs: Date.now() - startedAtMs,
        }),
      });
    if (isAborted) {
      return {
        summary,
        outcome: { status: 'FAILED', error: AGENT_RUN_STOPPED_ERROR },
        continuationCompletion,
      };
    }

    const outcome = await this.settleTurn({
      input,
      execution,
      wait,
      isAwaitingAnswer: finish?.isAwaitingAnswer ?? false,
      summary,
      suspension,
      stream,
    });

    return { summary, outcome, continuationCompletion };
  }

  private async recordContinuationCompletion({
    workspaceId,
    wakeUpId,
    suspension,
    turnId,
    execution,
    startedAtMs,
    streamed,
    waitCondition,
    isAborted,
  }: {
    workspaceId: string;
    wakeUpId?: string;
    suspension: AgentRunSuspension | null;
    turnId: string;
    execution: AgentExecutionResult;
    startedAtMs: number;
    streamed: Pick<AgentTurnStreamResult, 'assistantMessageId' | 'replyParts'>;
    waitCondition: PendingWakeUpCondition | null;
    isAborted: boolean;
  }): Promise<AgentRunContinuationCompletion | undefined> {
    if (!isDefined(wakeUpId) || !isDefined(suspension)) {
      return undefined;
    }

    const awaitingParts = findAwaitingPausingToolParts(streamed.replyParts);
    const isAwaitingAnswer =
      isNonEmptyArray(awaitingParts) &&
      awaitingParts.every(({ isAnswerable }) => isAnswerable);
    const continuationCompletion: AgentRunContinuationCompletion = {
      turnId,
      execution: {
        result: execution.result,
        stopReason: execution.stopReason,
        isPaused: execution.isPaused,
      },
      summary: sumAgentRunSummaries({
        previousSummary: suspension.summary,
        nextSummary: buildAgentRunSummary({
          execution,
          durationMs: Date.now() - startedAtMs,
        }),
      }),
      waitCondition,
      isAborted,
      isAwaitingAnswer,
      questionMessageId: isAwaitingAnswer ? streamed.assistantMessageId : null,
    };

    await this.pendingWakeUpService.updatePayload({
      workspaceId,
      wakeUpId,
      payload: { ...suspension, continuationCompletion },
    });

    return continuationCompletion;
  }

  private async openTurn({
    input: {
      workspaceId,
      conversation,
      turnId,
      persona,
      prompt,
      executionContext,
    },
    suspension,
  }: {
    input: Pick<
      AgentRunnerRunInput,
      | 'workspaceId'
      | 'conversation'
      | 'turnId'
      | 'persona'
      | 'prompt'
      | 'executionContext'
    >;
    suspension: AgentRunSuspension | null;
  }): Promise<OpenedAgentRunTurn> {
    if (!isDefined(conversation)) {
      return {
        turnId: await this.conversationWriterService.insertTurn({
          workspaceId,
          id: turnId,
          threadId: null,
          agentId: persona.agentId,
          status: AgentTurnStatus.RUNNING,
          createdBy: executionContext.turnCreatedBy,
        }),
        priorMessages: [],
      };
    }

    const { threadId, isCreated } = conversation;

    if (!isCreated && !isDefined(suspension)) {
      await this.agentRunSuspensionService.assertConversationNotSuspended({
        workspaceId,
        threadId,
      });
    }

    const openedTurn = await this.agentRunConversationService.openTurn({
      workspaceId,
      threadId,
      agentId: persona.agentId,
      turnId,
      senderUserWorkspaceId: prompt?.senderUserWorkspaceId ?? null,
      senderApplicationId: prompt?.senderApplicationId ?? null,
      createdBy: executionContext.turnCreatedBy,
      messages: prompt?.messages ?? [],
    });

    assertIsDefinedOrThrow(openedTurn);

    const {
      turnId: openedTurnId,
      promptMessageIds,
      hasTakenQueuedMessages,
    } = openedTurn;

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
        viewer: executionContext.conversationViewer,
      });

    return {
      turnId: openedTurnId,
      priorMessages: conversationMessages.filter(
        ({ id }) => !promptMessageIds.includes(id),
      ),
    };
  }

  private async settleTurn({
    input: { workspaceId, caller, spec },
    execution,
    wait,
    isAwaitingAnswer,
    summary,
    suspension,
    stream,
  }: {
    input: Pick<AgentRunnerRunInput, 'workspaceId' | 'caller' | 'spec'>;
    execution: Pick<AgentExecutionResult, 'result' | 'stopReason' | 'isPaused'>;
    wait:
      | Pick<NonNullable<ReturnType<typeof findAgentRunWait>>, 'condition'>
      | undefined;
    isAwaitingAnswer: boolean;
    summary: AgentRunSummary;
    suspension: AgentRunSuspension | null;
    stream: AgentRunStream | null;
  }): Promise<AgentRunnerOutcome> {
    if (!isDefined(execution.stopReason) && !execution.isPaused) {
      return { status: 'COMPLETED', result: execution.result };
    }

    // offered no way to pause, a run without a conversation or a caller stops early only when out of credits
    if (!isDefined(stream) || !isDefined(caller)) {
      return { status: 'FAILED', error: AGENT_RUN_OUT_OF_CREDITS_ERROR };
    }

    const { threadId, streamId } = stream.claim;
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
        error: AGENT_RUN_OUT_OF_CREDITS_ERROR,
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
