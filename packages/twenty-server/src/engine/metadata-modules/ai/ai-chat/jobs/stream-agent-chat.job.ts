import { Logger, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import {
  type CodeExecutionData,
  isSilentAgentChatMessageParts,
} from 'twenty-shared/ai';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type MessageQueueJobContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';

import { buildActorMetadataFromAuthContext } from 'src/engine/core-modules/actor/utils/build-actor-metadata-from-auth-context.util';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type StepDebitResult } from 'src/engine/metadata-modules/ai/ai-billing/types/step-debit-result.type';
import { findAwaitingPausingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-awaiting-pausing-tool-parts.util';
import { STREAM_AGENT_CHAT_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job-name.constant';
import { type StreamAgentChatJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job.types';
import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import {
  type AgentTurnStreamResult,
  AgentTurnStreamService,
} from 'src/engine/metadata-modules/ai/ai-chat/services/agent-turn-stream.service';
import { ChatExecutionService } from 'src/engine/metadata-modules/ai/ai-chat/services/chat-execution.service';
import { type AgentChatTurnOutcome } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-turn-outcome.type';
import { type AgentChatStreamClaim } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { hasReplyText } from 'src/engine/metadata-modules/ai/ai-chat/utils/has-reply-text.util';
import { tagAiChatStreamScope } from 'src/engine/metadata-modules/ai/ai-chat/utils/tag-ai-chat-stream-scope.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { mapErrorToStreamError } from 'src/engine/metadata-modules/ai/ai-history/utils/map-error-to-stream-error.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { getChatModelId } from 'src/engine/metadata-modules/ai/ai-models/utils/get-chat-model-id.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Processor({ queueName: MessageQueue.aiStreamQueue, scope: Scope.REQUEST })
export class StreamAgentChatJob {
  private readonly logger = new Logger(StreamAgentChatJob.name);

  // keeps the catch in handle() from counting a turn the stream already classified
  private hasRecordedTurnOutcome = false;

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly chatExecutionService: ChatExecutionService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly turnStreamService: AgentTurnStreamService,
    private readonly metricsService: MetricsService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly actorService: AgentChatActorService,
    private readonly turnRecorderService: AgentTurnRecorderService,
  ) {}

  @Process(STREAM_AGENT_CHAT_JOB_NAME)
  async handle(
    data: StreamAgentChatJobData,
    context?: MessageQueueJobContext,
  ): Promise<void> {
    tagAiChatStreamScope({
      streamId: data.streamId,
      turnId: data.existingTurnId,
      threadId: data.threadId,
      workspaceId: data.workspaceId,
    });

    const thread = await this.threadRepository.findOne(data.workspaceId, {
      where: { id: data.threadId },
      select: ['id', 'activeStreamId'],
    });

    if (thread?.activeStreamId !== data.streamId) {
      this.logger.warn(
        `Skipping stream ${data.streamId} for thread ${data.threadId}: the thread no longer holds this claim`,
      );

      return;
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: data.workspaceId },
    });

    const turnModelId = this.resolveTurnModelId(data.modelId, workspace);

    this.metricsService.incrementCounterBy({
      key: MetricsKeys.AiChatTurnStarted,
      amount: 1,
      attributes: { model: turnModelId },
    });

    const claim = {
      threadId: data.threadId,
      workspaceId: data.workspaceId,
      streamId: data.streamId,
    };

    try {
      await this.turnStreamService.runClaimed({
        claim,
        jobAbortSignal: context?.abortSignal,
        work: (abortSignal) =>
          this.runTurn({ workspace, data, claim, turnModelId, abortSignal }),
      });
    } catch (error) {
      this.logger.error(
        `[AI_CHAT_TURN_FAILED] failurePhase=execution, model=${turnModelId}, threadId=${data.threadId}, workspaceId=${data.workspaceId}, streamId=${data.streamId}: ${formatErrorWithCause(error)}`,
      );

      this.recordTurnOutcome(
        {
          kind: 'failed',
          failurePhase: 'execution',
          errorCode: mapErrorToStreamError(error).code,
        },
        turnModelId,
      );

      await this.eventPublisherService
        .publish({
          threadId: data.threadId,
          workspaceId: data.workspaceId,
          event: { type: 'queue-updated' },
        })
        .catch(() => {});
      throw error;
    }
  }

  private async runTurn({
    workspace,
    data,
    claim,
    turnModelId,
    abortSignal,
  }: {
    workspace: WorkspaceEntity | null;
    data: StreamAgentChatJobData;
    claim: AgentChatStreamClaim;
    turnModelId: string;
    abortSignal: AbortSignal;
  }): Promise<void> {
    if (!workspace) {
      throw new AiException(
        `Workspace ${data.workspaceId} not found`,
        AiExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    const { message, sender, authorization } =
      await this.actorService.authorizeJob({
        workspaceId: data.workspaceId,
        threadId: data.threadId,
        messageId: data.messageId,
        turnId: data.existingTurnId,
        userWorkspaceId: data.userWorkspaceId,
      });

    const turnId = data.existingTurnId ?? message?.turnId;

    if (!isDefined(turnId)) {
      throw new AiException(
        'Message turn not found',
        AiExceptionCode.MESSAGE_NOT_FOUND,
      );
    }

    const isRunning = await this.turnRecorderService.markRunning({
      workspaceId: data.workspaceId,
      turnId,
      modelId: turnModelId,
      createdBy: buildActorMetadataFromAuthContext(authorization.authContext),
      streamClaim: claim,
    });

    // the stream was stopped while starting, and its turn already ended
    if (!isRunning) {
      return;
    }

    const titlePromise = data.hasTitle
      ? Promise.resolve(null)
      : this.agentChatService
          .generateTitleIfNeeded({
            userWorkspaceId: data.userWorkspaceId,
            threadId: data.threadId,
            messageContent: data.lastUserMessageText,
            workspaceId: data.workspaceId,
          })
          .catch(() => null);

    const result = await this.turnStreamService.stream({
      claim,
      turnId,
      startTurn: async (writer) => {
        const turn = await this.chatExecutionService.streamChat({
          workspace,
          userWorkspaceId: data.userWorkspaceId,
          sender,
          authorization,
          threadId: data.threadId,
          streamId: data.streamId,
          turnId,
          messages: data.messages,
          browsingContext: data.browsingContext,
          modelId: data.modelId,
          onCodeExecutionUpdate: (codeExecutionData: CodeExecutionData) => {
            writer.write({
              type: 'data-code-execution' as const,
              id: `code-execution-${codeExecutionData.executionId}`,
              data: codeExecutionData,
            });
          },
          onCompaction: () => {
            writer.write({
              type: 'data-compaction' as const,
              id: `compaction-${data.threadId}`,
              data: {},
            });
          },
          abortSignal,
          conversationSizeTokens: data.conversationSizeTokens,
          onUserCreditsExhausted: ({
            renewsAt,
            isFallingBackToWorkspaceCredits,
          }) =>
            this.eventPublisherService
              .publish({
                threadId: data.threadId,
                workspaceId: data.workspaceId,
                event: {
                  type: 'user-credits-exhausted',
                  workspaceMemberId:
                    authorization.authContext.workspaceMemberId,
                  isFallingBackToWorkspaceCredits,
                  renewsAt: renewsAt.toISOString(),
                },
              })
              .catch((error: unknown) =>
                this.logger.warn(
                  `Could not publish the user credits notice for stream ${data.streamId}: ${formatErrorWithCause(error)}`,
                ),
              ),
        });

        return {
          source: {
            parts: turn.stream.stream,
            modelConfig: turn.modelConfig,
            getStreamError: turn.getStreamError,
            pendingWrites: titlePromise.then((generatedTitle) => {
              if (generatedTitle) {
                writer.write({
                  type: 'data-thread-title' as const,
                  id: `thread-title-${data.threadId}`,
                  data: { title: generatedTitle },
                });
              }
            }),
          },
          getStopReason: turn.getStopReason,
        };
      },
    });

    const stopReason = result.started.getStopReason();

    this.logTurnWithoutText({
      result,
      stopReason,
      threadId: data.threadId,
      workspaceId: data.workspaceId,
      modelId: turnModelId,
    });

    const finish = await this.turnStreamService.finishTurn({
      claim,
      turnId,
      result,
      modelId: turnModelId,
      stopReason,
    });

    if (isDefined(finish)) {
      this.recordTurnOutcome(finish.outcome, turnModelId);

      if (isDefined(finish.threadBefore)) {
        await this.agentChatService.notifyThreadUsageUpdated({
          threadBefore: finish.threadBefore,
          workspaceMemberId: authorization.authContext.workspaceMemberId,
          workspaceId: data.workspaceId,
        });
      }
    }

    // a worker shutting down interrupted the turn, which fails rather than ends as stopped
    if (abortSignal.reason instanceof AiException) {
      throw abortSignal.reason;
    }

    if (isDefined(result.streamError)) {
      throw result.streamError;
    }

    await this.turnStreamService.publishTurnEnd({
      claim,
      assistantMessageId: result.assistantMessageId,
      stopReason,
    });
  }

  // resolve auto-select ids here so turn-start and outcome metrics carry the same model label
  private resolveTurnModelId(
    requestedModelId: string | undefined,
    workspace: WorkspaceEntity | null,
  ): string {
    const modelId = isDefined(workspace)
      ? getChatModelId({ requestedModelId, workspace })
      : requestedModelId;

    if (!isNonEmptyString(modelId)) {
      return 'unknown';
    }

    try {
      return this.aiModelRegistryService.getEffectiveModelConfig(
        modelId,
        workspace ?? undefined,
      ).modelId;
    } catch {
      return modelId;
    }
  }

  private recordTurnOutcome(
    outcome: AgentChatTurnOutcome,
    turnModelId: string,
  ): void {
    if (this.hasRecordedTurnOutcome) {
      return;
    }

    this.hasRecordedTurnOutcome = true;

    switch (outcome.kind) {
      case 'completed':
        this.metricsService.incrementCounterBy({
          key: MetricsKeys.AiChatTurnCompleted,
          amount: 1,
          attributes: { model: turnModelId, outcome: outcome.outcome },
        });

        return;
      case 'cancelled':
        this.metricsService.incrementCounterBy({
          key: MetricsKeys.AiChatTurnCancelled,
          amount: 1,
          attributes: { model: turnModelId, reason: outcome.reason },
        });

        return;
      case 'failed':
        this.metricsService.incrementCounterBy({
          key: MetricsKeys.AiChatTurnFailed,
          amount: 1,
          attributes: {
            model: turnModelId,
            failure_phase: outcome.failurePhase,
            ...(isDefined(outcome.errorCode) && {
              error_code: outcome.errorCode,
            }),
          },
        });

        return;
      default:
        return assertUnreachable(outcome);
    }
  }

  private logTurnWithoutText({
    result: { replyParts, isAborted, streamError, usage },
    stopReason,
    threadId,
    workspaceId,
    modelId,
  }: {
    result: AgentTurnStreamResult;
    stopReason: StepDebitResult['stopReason'];
    threadId: string;
    workspaceId: string;
    modelId: string;
  }): void {
    const hasText = hasReplyText(replyParts);

    if (
      (!isAborted && hasText) ||
      findAwaitingPausingToolParts(replyParts).length > 0 ||
      isSilentAgentChatMessageParts(replyParts)
    ) {
      return;
    }

    const reason = isAborted
      ? 'user-cancelled'
      : streamError
        ? 'stream-error'
        : stopReason === 'userAllowance'
          ? 'user-credits-exhausted'
          : stopReason === 'workspaceAllowance'
            ? 'credits-exhausted'
            : 'empty-completion';

    const errorDetail = isDefined(streamError)
      ? formatErrorWithCause(streamError)
      : 'none';

    this.logger.warn(
      `[AI_CHAT_NO_TEXT] Assistant turn ended without a text reply — ` +
        `reason=${reason}, model=${modelId}, ` +
        `threadId=${threadId}, workspaceId=${workspaceId}, ` +
        `isAborted=${isAborted}, stopReason=${stopReason}, hasText=${hasText}, ` +
        `streamError=${errorDetail}, ` +
        `inputTokens=${usage.inputTokens},` +
        `responseMessage.parts=${JSON.stringify(replyParts)}`,
    );

    if (streamError instanceof Error && isDefined(streamError.stack)) {
      this.logger.warn(
        `[AI_CHAT_NO_TEXT] streamError stack — threadId=${threadId}: ${streamError.stack}`,
      );
    }
  }
}
