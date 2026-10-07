import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { findAwaitingCallText } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-awaiting-call-text.util';
import { findLastMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-last-message-text.util';
import { updateAgentChatThreadUsage } from 'src/engine/metadata-modules/ai/ai-chat/utils/update-agent-chat-thread-usage.util';
import { mapAgentChatTurnOutcomeToTurnStatus } from 'src/engine/metadata-modules/ai/ai-chat/utils/map-agent-chat-turn-outcome-to-turn-status.util';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { buildActorMetadataFromAuthContext } from 'src/engine/core-modules/actor/utils/build-actor-metadata-from-auth-context.util';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { Logger, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import {
  createUIMessageStream,
  readUIMessageStream,
  toUIMessageStream,
} from 'ai';
import {
  type CodeExecutionData,
  type ExtendedUIMessage,
} from 'twenty-shared/ai';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v5 as uuidv5 } from 'uuid';

import { type MessageQueueJobContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { addStepToAgentTurnUsage } from 'src/engine/metadata-modules/ai/ai-billing/utils/compute-agent-turn-usage-from-steps.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { findAwaitingPausingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-awaiting-pausing-tool-parts.util';
import { AgentChatCancelSubscriberService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-cancel-subscriber.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamHeartbeatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-heartbeat.service';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import {
  type ChatExecutionOptions,
  ChatExecutionService,
} from 'src/engine/metadata-modules/ai/ai-chat/services/chat-execution.service';
import { type AgentChatTurnOutcome } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-turn-outcome.type';
import {
  classifyAgentChatTurnOutcome,
  resolveSupersededTurnOutcome,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/classify-agent-chat-turn-outcome.util';
import { AGENT_CHAT_CHECKPOINT_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-checkpoint-interval-ms.constant';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { getCancelChannel } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-cancel-channel.util';
import { mapErrorToStreamError } from 'src/engine/metadata-modules/ai/ai-history/utils/map-error-to-stream-error.util';
import { tagAiChatStreamScope } from 'src/engine/metadata-modules/ai/ai-chat/utils/tag-ai-chat-stream-scope.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import type { AiModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';

import { STREAM_AGENT_CHAT_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job-name.constant';
import { type StreamAgentChatJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job.types';
import { getChatModelId } from 'src/engine/metadata-modules/ai/ai-models/utils/get-chat-model-id.util';

// assistantMessageId derives from streamId, so a retried job skips persistence while each resume persists its own message
const ASSISTANT_MESSAGE_ID_NAMESPACE = '0b9c2a3d-4e5f-4a1b-8c2d-3e4f5a6b7c8d';

type StreamUsageTotals = {
  inputTokens: number;
  outputTokens: number;
  inputCredits: number;
  outputCredits: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  conversationSize: number;
};

@Processor({ queueName: MessageQueue.aiStreamQueue, scope: Scope.REQUEST })
export class StreamAgentChatJob {
  private readonly logger = new Logger(StreamAgentChatJob.name);

  // keeps the catch in handle() from counting a turn the stream already classified
  private hasRecordedTurnOutcome = false;

  // set once the turn pauses on a person: a queued message drained then would bypass the pending answer
  private isAwaitingInput = false;

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly chatExecutionService: ChatExecutionService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly cancelSubscriberService: AgentChatCancelSubscriberService,
    private readonly agentChatStreamingService: AgentChatStreamingService,
    private readonly streamHeartbeatService: AgentChatStreamHeartbeatService,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
    private readonly threadService: AgentChatThreadService,
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

    await this.eventPublisherService.resetStreamState(data.threadId);

    const abortController = new AbortController();
    const cancelChannel = getCancelChannel(data.threadId, data.streamId);

    const stopHeartbeat = this.streamHeartbeatService.startRunning(
      data.streamId,
    );

    await this.cancelSubscriberService.subscribe(cancelChannel, () => {
      abortController.abort();
    });

    context?.abortSignal?.addEventListener(
      'abort',
      () => {
        abortController.abort(
          new AiException(
            'The response was interrupted before it could finish.',
            AiExceptionCode.STREAM_INTERRUPTED,
          ),
        );
      },
      { once: true },
    );

    try {
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
        streamClaim: { threadId: data.threadId, streamId: data.streamId },
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

      await this.buildAndPublishStream({
        workspace,
        data,
        turnId,
        sender,
        authorization,
        titlePromise,
        abortSignal: abortController.signal,
        turnModelId,
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

      await this.streamRecoveryService.failStream({
        threadId: data.threadId,
        workspaceId: data.workspaceId,
        streamId: data.streamId,
        error,
      });

      await this.eventPublisherService
        .publish({
          threadId: data.threadId,
          workspaceId: data.workspaceId,
          event: { type: 'queue-updated' },
        })
        .catch(() => {});
      throw error;
    } finally {
      stopHeartbeat();
      await this.cancelSubscriberService.unsubscribe(cancelChannel);
      await this.streamRecoveryService.releaseStreamClaim({
        threadId: data.threadId,
        workspaceId: data.workspaceId,
        streamId: data.streamId,
      });

      if (!abortController.signal.aborted && !this.isAwaitingInput) {
        await this.agentChatStreamingService
          .flushNextQueuedMessage({
            threadId: data.threadId,
            workspaceId: data.workspaceId,
          })
          .catch((error) => {
            this.logger.error(
              `Failed to flush queued message for thread ${data.threadId}: ${formatErrorWithCause(error)}`,
            );
          });
      }
    }
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

  private async buildAndPublishStream({
    workspace,
    data,
    turnId,
    sender,
    authorization,
    titlePromise,
    abortSignal,
    turnModelId,
  }: {
    workspace: WorkspaceEntity;
    data: StreamAgentChatJobData;
    turnId: string;
    sender: ChatExecutionOptions['sender'];
    authorization: ChatExecutionOptions['authorization'];
    titlePromise: Promise<string | null>;
    abortSignal: AbortSignal;
    turnModelId: string;
  }): Promise<void> {
    const assistantMessageId = uuidv5(
      data.streamId,
      ASSISTANT_MESSAGE_ID_NAMESPACE,
    );

    return new Promise<void>((resolve, reject) => {
      const usageTotals: StreamUsageTotals = {
        inputTokens: 0,
        outputTokens: 0,
        inputCredits: 0,
        outputCredits: 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        conversationSize: 0,
      };
      let streamError: unknown;
      let streamFinishError: unknown;
      let checkHasNoMoreAvailableCredits: () => boolean = () => false;

      let persistChain: Promise<void> = Promise.resolve();
      let lastCheckpointAt = 0;
      let isFinalizingPersist = false;

      const enqueueAssistantPersist = (
        persist: () => Promise<void>,
      ): Promise<void> => {
        persistChain = persistChain.then(persist).catch((error) => {
          this.logger.warn(
            `Failed to checkpoint assistant message for stream ${data.streamId}: ${formatErrorWithCause(error)}`,
          );
        });

        return persistChain;
      };

      // onEnd fires before the uiStream drains, so message-persisted waits on this
      let resolveStreamFinished: () => void;
      const streamFinishedPromise = new Promise<void>((res) => {
        resolveStreamFinished = res;
      });

      abortSignal.addEventListener(
        'abort',
        () => {
          const reason = abortSignal.reason;

          void streamFinishedPromise.then(() => {
            if (reason instanceof AiException) {
              reject(reason);
            } else {
              resolve();
            }
          });
        },
        { once: true },
      );

      const uiStream = createUIMessageStream<ExtendedUIMessage>({
        execute: async ({ writer }) => {
          const onCodeExecutionUpdate = (
            codeExecutionData: CodeExecutionData,
          ) => {
            writer.write({
              type: 'data-code-execution' as const,
              id: `code-execution-${codeExecutionData.executionId}`,
              data: codeExecutionData,
            });
          };

          const onCompaction = () => {
            writer.write({
              type: 'data-compaction' as const,
              id: `compaction-${data.threadId}`,
              data: {},
            });
          };

          const {
            stream,
            modelConfig,
            hasNoMoreAvailableCredits,
            getStreamError,
          } = await this.chatExecutionService.streamChat({
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
            onCodeExecutionUpdate,
            onCompaction,
            abortSignal,
            conversationSizeTokens: data.conversationSizeTokens,
          });

          checkHasNoMoreAvailableCredits = hasNoMoreAvailableCredits;

          const titleWritePromise = titlePromise.then((generatedTitle) => {
            if (generatedTitle) {
              writer.write({
                type: 'data-thread-title' as const,
                id: `thread-title-${data.threadId}`,
                data: { title: generatedTitle },
              });
            }
          });

          writer.merge(
            toUIMessageStream({
              stream: stream.stream,
              onError: formatErrorWithCause,
              sendStart: true,
              generateMessageId: () => assistantMessageId,
              messageMetadata: ({ part }) =>
                this.computeMessageMetadata({ part, modelConfig, usageTotals }),
              onEnd: async ({ responseMessage, isAborted }) => {
                // Rejecting here would race chunks still draining.
                try {
                  streamError ??= getStreamError();
                  isFinalizingPersist = true;
                  await persistChain;
                  const outcome = await this.persistStreamFinish({
                    assistantMessageId,
                    streamId: data.streamId,
                    responseMessage,
                    isAborted,
                    streamError,
                    outOfCredits: checkHasNoMoreAvailableCredits(),
                    threadId: data.threadId,
                    workspaceId: data.workspaceId,
                    workspaceMemberId:
                      authorization.authContext.workspaceMemberId,
                    usageTotals,
                    modelConfig,
                    turnModelId,
                    turnId,
                  });

                  if (isDefined(outcome)) {
                    this.recordTurnOutcome(outcome, turnModelId);
                  }
                  await titleWritePromise;
                } catch (error) {
                  streamFinishError = error;
                } finally {
                  resolveStreamFinished();
                }
              },
              sendReasoning: true,
            }),
          );
        },
        // Errors thrown before the model stream merges never reach onEnd.
        onError: (error) => {
          streamError = error;
          resolveStreamFinished();

          return formatErrorWithCause(error);
        },
      });

      const [publishStream, checkpointStream] = uiStream.tee();

      void (async () => {
        try {
          for await (const message of readUIMessageStream<ExtendedUIMessage>({
            stream: checkpointStream,
            terminateOnError: false,
          })) {
            if (isFinalizingPersist || message.parts.length === 0) {
              continue;
            }

            const now = Date.now();

            if (now - lastCheckpointAt < AGENT_CHAT_CHECKPOINT_INTERVAL_MS) {
              continue;
            }

            lastCheckpointAt = now;
            const parts = message.parts;

            void enqueueAssistantPersist(async () => {
              if (isFinalizingPersist) {
                return;
              }

              await this.agentChatService.upsertAssistantMessage({
                id: assistantMessageId,
                threadId: data.threadId,
                turnId,
                parts,
                workspaceId: data.workspaceId,
              });
            });
          }
        } catch {
          // best-effort; the authoritative persist runs onEnd
        }
      })();

      // message-persisted must reach the client after every stream-chunk
      void (async () => {
        try {
          for await (const chunk of publishStream) {
            if ((chunk as { type?: string }).type === 'error') {
              continue;
            }

            await this.eventPublisherService.publish({
              threadId: data.threadId,
              workspaceId: data.workspaceId,
              event: {
                type: 'stream-chunk',
                chunk: chunk as Record<string, unknown>,
              },
            });
          }

          await streamFinishedPromise;

          if (streamError) {
            reject(streamError);
          } else if (streamFinishError) {
            reject(streamFinishError);
          } else if (checkHasNoMoreAvailableCredits()) {
            await this.eventPublisherService.publish({
              threadId: data.threadId,
              workspaceId: data.workspaceId,
              event: { type: 'credits-exhausted' },
            });
            resolve();
          } else {
            await this.eventPublisherService.publish({
              threadId: data.threadId,
              workspaceId: data.workspaceId,
              event: {
                type: 'message-persisted',
                messageId: assistantMessageId,
              },
            });
            resolve();
          }
        } catch (error) {
          reject(error);
        }
      })();
    });
  }

  private computeMessageMetadata({
    part,
    modelConfig,
    usageTotals,
  }: {
    part: {
      type: string;
      usage?: {
        inputTokens?: number;
        outputTokens?: number;
        inputTokenDetails?: { cacheReadTokens?: number };
        outputTokenDetails?: { reasoningTokens?: number };
      };
      providerMetadata?: Record<string, Record<string, unknown> | undefined>;
    };
    modelConfig: AiModelConfig;
    usageTotals: StreamUsageTotals;
  }) {
    if (part.type === 'finish-step') {
      Object.assign(
        usageTotals,
        addStepToAgentTurnUsage(modelConfig, usageTotals, part),
      );
      usageTotals.conversationSize = part.usage?.inputTokens ?? 0;
    }

    if (part.type === 'finish') {
      return {
        createdAt: new Date().toISOString(),
        usage: {
          inputTokens: usageTotals.inputTokens,
          outputTokens: usageTotals.outputTokens,
          cachedInputTokens: usageTotals.cacheReadTokens,
          inputCredits: toDisplayCredits(usageTotals.inputCredits),
          outputCredits: toDisplayCredits(usageTotals.outputCredits),
          conversationSize: usageTotals.conversationSize,
        },
        model: {
          contextWindowTokens: modelConfig.contextWindowTokens,
        },
      };
    }

    return undefined;
  }

  // null on stream error: the catch in handle() already counts that turn
  private async persistStreamFinish({
    assistantMessageId,
    streamId,
    responseMessage,
    isAborted,
    streamError,
    outOfCredits,
    threadId,
    workspaceId,
    workspaceMemberId,
    usageTotals,
    modelConfig,
    turnModelId,
    turnId,
  }: {
    assistantMessageId: string;
    streamId: string;
    responseMessage: Omit<ExtendedUIMessage, 'id'>;
    isAborted: boolean;
    streamError: unknown;
    outOfCredits: boolean;
    threadId: string;
    workspaceId: string;
    workspaceMemberId: string;
    usageTotals: StreamUsageTotals;
    modelConfig: AiModelConfig;
    turnModelId: string;
    turnId: string;
  }): Promise<AgentChatTurnOutcome | null> {
    // A turn that only waits on the member still needs a preview in chat lists
    const replyText =
      findLastMessageText(responseMessage.parts) ??
      findAwaitingCallText(responseMessage.parts);
    const hasText = responseMessage.parts.some(
      (part) => part.type === 'text' && isNonEmptyString(part.text),
    );

    const awaitingParts = findAwaitingPausingToolParts(responseMessage.parts);
    // without an answerable call nothing can resume the turn, so fail rather than wait forever
    const isAwaitingAnswer =
      awaitingParts.length > 0 &&
      awaitingParts.every(({ isAnswerable }) => isAnswerable);

    if ((isAborted || !hasText) && awaitingParts.length === 0) {
      this.logAssistantTurnWithoutText({
        responseMessage,
        isAborted,
        streamError,
        outOfCredits,
        hasText,
        threadId,
        workspaceId,
        inputTokens: usageTotals.inputTokens,
        modelId: turnModelId,
      });
    }

    await this.recordTurnUsage({ workspaceId, threadId, turnId, usageTotals });

    if (isDefined(streamError)) {
      return null;
    }

    const outcome = classifyAgentChatTurnOutcome({
      hasText,
      isAborted,
      isAwaitingUserAnswer: awaitingParts.length > 0,
      outOfCredits,
    });

    if (responseMessage.parts.length === 0) {
      await this.finishTurn({
        workspaceId,
        turnId,
        threadId,
        streamId,
        outcome,
        turnModelId,
      });

      return outcome;
    }

    const threadBeforeUsage = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });

    if (!threadBeforeUsage || threadBeforeUsage.deletedAt) {
      return resolveSupersededTurnOutcome(outcome);
    }

    await this.agentChatService.upsertAssistantMessage({
      id: assistantMessageId,
      threadId,
      turnId,
      parts: responseMessage.parts,
      workspaceId,
    });

    const totalsUpdate = await updateAgentChatThreadUsage({
      repository: this.threadRepository,
      workspaceId,
      threadId,
      streamId,
      lastMessageText: replyText,
      usage: {
        contextWindowTokens: modelConfig.contextWindowTokens,
        conversationSize: usageTotals.conversationSize,
        pendingQuestionMessageId: isAwaitingAnswer ? assistantMessageId : null,
      },
    });

    if (!totalsUpdate.affected) {
      // The reply is saved even though a newer stream owns the thread. That
      // activity is best-effort and must not turn the saved reply into an error
      await this.threadService
        .recordThreadActivity({ workspaceId, threadId, text: replyText })
        .catch((error: unknown) =>
          this.logger.warn(
            `Could not record reply activity on thread ${threadId}: ${formatErrorWithCause(error)}`,
          ),
        );

      return resolveSupersededTurnOutcome(outcome);
    }

    if (awaitingParts.length > 0 && !isAwaitingAnswer) {
      throw new AiException(
        'A call waiting on the user could not be read',
        AiExceptionCode.INVALID_TOOL_CALL_OUTPUT,
      );
    }

    this.isAwaitingInput = isAwaitingAnswer;

    await this.finishTurn({
      workspaceId,
      turnId,
      threadId,
      streamId,
      outcome,
      turnModelId,
    });

    await this.agentChatService.notifyThreadUsageUpdated({
      threadBefore: threadBeforeUsage,
      workspaceMemberId,
      workspaceId,
    });

    return outcome;
  }

  // Usage is recorded on its own: a failure to count it must not fail a reply already saved
  private async recordTurnUsage({
    workspaceId,
    threadId,
    turnId,
    usageTotals,
  }: {
    workspaceId: string;
    threadId: string;
    turnId: string;
    usageTotals: StreamUsageTotals;
  }): Promise<void> {
    await this.turnRecorderService
      .recordUsage({
        workspaceId,
        threadId,
        turnId,
        usage: {
          inputTokens: usageTotals.inputTokens,
          outputTokens: usageTotals.outputTokens,
          cacheReadTokens: usageTotals.cacheReadTokens,
          cacheCreationTokens: usageTotals.cacheCreationTokens,
          inputCredits: usageTotals.inputCredits,
          outputCredits: usageTotals.outputCredits,
        },
      })
      .catch((error: unknown) =>
        this.logger.warn(
          `Could not record the usage of turn ${turnId}: ${formatErrorWithCause(error)}`,
        ),
      );
  }

  private async finishTurn({
    workspaceId,
    turnId,
    threadId,
    streamId,
    outcome,
    turnModelId,
  }: {
    workspaceId: string;
    turnId: string;
    threadId: string;
    streamId: string;
    outcome: AgentChatTurnOutcome;
    turnModelId: string;
  }): Promise<void> {
    await this.turnRecorderService.finish({
      workspaceId,
      turnId,
      ...mapAgentChatTurnOutcomeToTurnStatus(outcome),
      modelId: turnModelId,
      streamClaim: { threadId, streamId },
    });
  }

  private logAssistantTurnWithoutText({
    responseMessage,
    isAborted,
    streamError,
    outOfCredits,
    hasText,
    threadId,
    workspaceId,
    inputTokens,
    modelId,
  }: {
    responseMessage: Omit<ExtendedUIMessage, 'id'>;
    isAborted: boolean;
    streamError: unknown;
    outOfCredits: boolean;
    hasText: boolean;
    threadId: string;
    workspaceId: string;
    inputTokens: number;
    modelId: string;
  }): void {
    const reason = isAborted
      ? 'user-cancelled'
      : streamError
        ? 'stream-error'
        : outOfCredits
          ? 'credits-exhausted'
          : 'empty-completion';

    const errorDetail = isDefined(streamError)
      ? formatErrorWithCause(streamError)
      : 'none';

    this.logger.warn(
      `[AI_CHAT_NO_TEXT] Assistant turn ended without a text reply — ` +
        `reason=${reason}, model=${modelId}, ` +
        `threadId=${threadId}, workspaceId=${workspaceId}, ` +
        `isAborted=${isAborted}, outOfCredits=${outOfCredits}, hasText=${hasText}, ` +
        `streamError=${errorDetail}, ` +
        `inputTokens=${inputTokens},` +
        `responseMessage.parts=${JSON.stringify(responseMessage.parts)}`,
    );

    if (streamError instanceof Error && isDefined(streamError.stack)) {
      this.logger.warn(
        `[AI_CHAT_NO_TEXT] streamError stack — threadId=${threadId}: ${streamError.stack}`,
      );
    }
  }
}
