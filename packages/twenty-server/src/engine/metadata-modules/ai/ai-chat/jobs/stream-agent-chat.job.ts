import { Logger, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { createUIMessageStream, readUIMessageStream } from 'ai';
import type {
  CodeExecutionData,
  ExtendedUIMessage,
  ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
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
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { computeCostBreakdown } from 'src/engine/metadata-modules/ai/ai-billing/utils/compute-cost-breakdown.util';
import { convertDollarsToBillingCredits } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-billing-credits.util';
import { extractCacheCreationTokens } from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatCancelSubscriberService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-cancel-subscriber.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamHeartbeatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-heartbeat.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { ChatExecutionService } from 'src/engine/metadata-modules/ai/ai-chat/services/chat-execution.service';
import { findPendingQuestionPart } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-pending-question-part.util';
import { AGENT_CHAT_CHECKPOINT_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-checkpoint-interval-ms.constant';
import { getCancelChannel } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-cancel-channel.util';
import { mapErrorToStreamError } from 'src/engine/metadata-modules/ai/ai-chat/utils/map-error-to-stream-error.util';
import { tagAiChatStreamScope } from 'src/engine/metadata-modules/ai/ai-chat/utils/tag-ai-chat-stream-scope.util';
import type { AiModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

import { STREAM_AGENT_CHAT_JOB_NAME } from './stream-agent-chat-job-name.constant';
import { type StreamAgentChatJobData } from './stream-agent-chat-job.types';

export { STREAM_AGENT_CHAT_JOB_NAME, type StreamAgentChatJobData };

// Derive assistantMessageId deterministically from streamId so assistant-message
// persistence is idempotent per stream: a retried job for the stream is skipped,
// while each distinct resume in a turn persists its own message.
const ASSISTANT_MESSAGE_ID_NAMESPACE = '0b9c2a3d-4e5f-4a1b-8c2d-3e4f5a6b7c8d';

@Processor({ queueName: MessageQueue.aiStreamQueue, scope: Scope.REQUEST })
export class StreamAgentChatJob {
  private readonly logger = new Logger(StreamAgentChatJob.name);

  constructor(
    @InjectWorkspaceScopedRepository(AgentChatThreadEntity)
    private readonly threadRepository: WorkspaceScopedRepository<AgentChatThreadEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly chatExecutionService: ChatExecutionService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly cancelSubscriberService: AgentChatCancelSubscriberService,
    private readonly agentChatStreamingService: AgentChatStreamingService,
    private readonly streamHeartbeatService: AgentChatStreamHeartbeatService,
    private readonly metricsService: MetricsService,
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

    this.metricsService.incrementCounterBy({
      key: MetricsKeys.AiChatTurnStarted,
      amount: 1,
      attributes: { model: data.modelId ?? 'unknown' },
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
      const workspace = await this.workspaceRepository.findOne({
        where: { id: data.workspaceId },
      });

      if (!workspace) {
        throw new AiException(
          `Workspace ${data.workspaceId} not found`,
          AiExceptionCode.WORKSPACE_NOT_FOUND,
        );
      }

      await this.executeStream(data, workspace, abortController.signal);
    } catch (error) {
      this.logger.error(
        `Stream ${data.streamId} failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      const streamError = mapErrorToStreamError(error);

      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AiChatTurnFailed,
        amount: 1,
        attributes: {
          model: data.modelId ?? 'unknown',
          failure_phase: 'execution',
          error_code: streamError.code,
        },
      });

      await this.threadRepository
        .update(
          data.workspaceId,
          { id: data.threadId },
          {
            lastStreamError: {
              ...streamError,
              failedAt: new Date().toISOString(),
            },
          },
        )
        .catch((persistError) => {
          this.logger.error(
            `Failed to persist stream error for thread ${data.threadId}: ${persistError instanceof Error ? persistError.message : String(persistError)}`,
          );
        });

      await this.eventPublisherService
        .publish({
          threadId: data.threadId,
          workspaceId: data.workspaceId,
          event: {
            type: 'stream-error',
            code: streamError.code,
            message: streamError.message,
          },
        })
        .catch(() => {});

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
      await this.streamHeartbeatService.clear(data.streamId);
      await this.cancelSubscriberService.unsubscribe(cancelChannel);
      await this.threadRepository
        .update(
          data.workspaceId,
          { id: data.threadId, activeStreamId: data.streamId },
          { activeStreamId: null },
        )
        .catch(() => {});

      if (!abortController.signal.aborted) {
        await this.agentChatStreamingService
          .flushNextQueuedMessage(
            data.threadId,
            data.userWorkspaceId,
            data.workspaceId,
            data.hasTitle,
          )
          .catch((error) => {
            this.logger.error(
              `Failed to flush queued message for thread ${data.threadId}: ${error instanceof Error ? error.message : String(error)}`,
            );
          });
      }
    }
  }

  private async executeStream(
    data: StreamAgentChatJobData,
    workspace: WorkspaceEntity,
    abortSignal: AbortSignal,
  ): Promise<void> {
    // When processing a promoted queued message, the user message already
    // exists in the DB with a turn — skip persisting it again.
    const userMessagePromise = data.existingTurnId
      ? Promise.resolve({ turnId: data.existingTurnId })
      : this.agentChatService.addMessage({
          threadId: data.threadId,
          uiMessage: {
            role: AgentMessageRole.USER,
            parts: data.lastUserMessageParts.filter(
              (part): part is ExtendedUIMessagePart =>
                part.type === 'text' || part.type === 'file',
            ),
          },
          workspaceId: data.workspaceId,
        });

    userMessagePromise.catch(() => {});

    const titlePromise = data.hasTitle
      ? Promise.resolve(null)
      : this.agentChatService
          .generateTitleIfNeeded({
            threadId: data.threadId,
            messageContent: data.lastUserMessageText,
            workspaceId: data.workspaceId,
          })
          .catch(() => null);

    await this.buildAndPublishStream({
      workspace,
      data,
      userMessagePromise,
      titlePromise,
      abortSignal,
    });
  }

  private async buildAndPublishStream({
    workspace,
    data,
    userMessagePromise,
    titlePromise,
    abortSignal,
  }: {
    workspace: WorkspaceEntity;
    data: StreamAgentChatJobData;
    userMessagePromise: Promise<{ turnId: string | null }>;
    titlePromise: Promise<string | null>;
    abortSignal: AbortSignal;
  }): Promise<void> {
    const assistantMessageId = uuidv5(
      data.streamId,
      ASSISTANT_MESSAGE_ID_NAMESPACE,
    );

    return new Promise<void>((resolve, reject) => {
      let streamUsage = {
        inputTokens: 0,
        outputTokens: 0,
        inputCredits: 0,
        outputCredits: 0,
        cacheReadTokens: 0,
      };
      let lastStepConversationSize = 0;
      let totalCacheCreationTokens = 0;
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
            `Failed to checkpoint assistant message for stream ${data.streamId}: ${error instanceof Error ? error.message : String(error)}`,
          );
        });

        return persistChain;
      };

      // onFinish fires before the uiStream is fully drained. We use this
      // promise to coordinate: the IIFE waits for DB persist to complete
      // before publishing message-persisted (after all chunks).
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

          const { stream, modelConfig, hasNoMoreAvailableCredits } =
            await this.chatExecutionService.streamChat({
              workspace,
              userWorkspaceId: data.userWorkspaceId,
              threadId: data.threadId,
              streamId: data.streamId,
              turnId: data.existingTurnId,
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
            stream.toUIMessageStream({
              onError: (error) => {
                streamError = error;

                return error instanceof Error ? error.message : String(error);
              },
              sendStart: true,
              generateMessageId: () => assistantMessageId,
              messageMetadata: ({ part }) => {
                return this.computeMessageMetadata({
                  part,
                  modelConfig,
                  lastStepConversationSize,
                  totalCacheCreationTokens,
                  onUpdateUsage: (usage) => {
                    streamUsage = usage;
                  },
                  onUpdateConversationSize: (size) => {
                    lastStepConversationSize = size;
                  },
                  onUpdateCacheCreationTokens: (tokens) => {
                    totalCacheCreationTokens = tokens;
                  },
                });
              },
              onFinish: async ({ responseMessage, isAborted }) => {
                // Rejecting here would race chunks still draining.
                try {
                  isFinalizingPersist = true;
                  await persistChain;
                  await this.handleStreamFinish({
                    assistantMessageId,
                    streamId: data.streamId,
                    responseMessage,
                    isAborted,
                    streamError,
                    outOfCredits: checkHasNoMoreAvailableCredits(),
                    threadId: data.threadId,
                    workspaceId: data.workspaceId,
                    userWorkspaceId: data.userWorkspaceId,
                    streamUsage,
                    lastStepConversationSize,
                    totalCacheCreationTokens,
                    modelConfig,
                    userMessagePromise,
                  });
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
        // Errors thrown before the model stream merges never reach onFinish.
        onError: (error) => {
          streamError = error;
          resolveStreamFinished();

          return error instanceof Error ? error.message : String(error);
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

              const { turnId } = await userMessagePromise;

              if (!isDefined(turnId)) {
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
          // best-effort; the authoritative persist runs onFinish
        }
      })();

      // Publish all chunks first, then signal completion. This guarantees
      // message-persisted arrives after every stream-chunk on the client.
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
    lastStepConversationSize,
    totalCacheCreationTokens,
    onUpdateUsage,
    onUpdateConversationSize,
    onUpdateCacheCreationTokens,
  }: {
    part: {
      type: string;
      usage?: {
        inputTokens?: number;
      };
      totalUsage?: {
        inputTokens?: number;
        outputTokens?: number;
        inputTokenDetails?: { cacheReadTokens?: number };
        outputTokenDetails?: { reasoningTokens?: number };
      };
      providerMetadata?: Record<string, Record<string, unknown> | undefined>;
    };
    modelConfig: AiModelConfig;
    lastStepConversationSize: number;
    totalCacheCreationTokens: number;
    onUpdateUsage: (usage: {
      inputTokens: number;
      outputTokens: number;
      inputCredits: number;
      outputCredits: number;
      cacheReadTokens: number;
    }) => void;
    onUpdateConversationSize: (size: number) => void;
    onUpdateCacheCreationTokens: (tokens: number) => void;
  }) {
    if (part.type === 'finish-step') {
      const stepInput = part.usage?.inputTokens ?? 0;
      const stepCacheCreation = extractCacheCreationTokens(
        part.providerMetadata,
      );

      onUpdateCacheCreationTokens(totalCacheCreationTokens + stepCacheCreation);
      onUpdateConversationSize(stepInput);
    }

    if (part.type === 'finish') {
      const breakdown = computeCostBreakdown(modelConfig, {
        inputTokens: part.totalUsage?.inputTokens,
        outputTokens: part.totalUsage?.outputTokens,
        cachedInputTokens: part.totalUsage?.inputTokenDetails?.cacheReadTokens,
        reasoningTokens: part.totalUsage?.outputTokenDetails?.reasoningTokens,
        cacheCreationTokens: totalCacheCreationTokens,
      });

      const inputCredits = Math.round(
        convertDollarsToBillingCredits(breakdown.inputCostInDollars),
      );
      const outputCredits = Math.round(
        convertDollarsToBillingCredits(breakdown.outputCostInDollars),
      );

      onUpdateUsage({
        inputTokens: breakdown.tokenCounts.totalInputTokens,
        outputTokens: part.totalUsage?.outputTokens ?? 0,
        inputCredits,
        outputCredits,
        cacheReadTokens: breakdown.tokenCounts.cachedInputTokens,
      });

      return {
        createdAt: new Date().toISOString(),
        usage: {
          inputTokens: breakdown.tokenCounts.totalInputTokens,
          outputTokens: part.totalUsage?.outputTokens ?? 0,
          cachedInputTokens: breakdown.tokenCounts.cachedInputTokens,
          inputCredits: toDisplayCredits(inputCredits),
          outputCredits: toDisplayCredits(outputCredits),
          conversationSize: lastStepConversationSize,
        },
        model: {
          contextWindowTokens: modelConfig.contextWindowTokens,
        },
      };
    }

    return undefined;
  }

  private async handleStreamFinish({
    assistantMessageId,
    streamId,
    responseMessage,
    isAborted,
    streamError,
    outOfCredits,
    threadId,
    workspaceId,
    userWorkspaceId,
    streamUsage,
    lastStepConversationSize,
    totalCacheCreationTokens,
    modelConfig,
    userMessagePromise,
  }: {
    assistantMessageId: string;
    streamId: string;
    responseMessage: Omit<ExtendedUIMessage, 'id'>;
    isAborted: boolean;
    streamError: unknown;
    outOfCredits: boolean;
    threadId: string;
    workspaceId: string;
    userWorkspaceId: string;
    streamUsage: {
      inputTokens: number;
      outputTokens: number;
      inputCredits: number;
      outputCredits: number;
      cacheReadTokens: number;
    };
    lastStepConversationSize: number;
    totalCacheCreationTokens: number;
    modelConfig: AiModelConfig;
    userMessagePromise: Promise<{ turnId: string | null }>;
  }): Promise<void> {
    const hasText = responseMessage.parts.some(
      (part) => part.type === 'text' && isNonEmptyString(part.text),
    );

    const pendingQuestionPart = findPendingQuestionPart(responseMessage.parts);

    if ((isAborted || !hasText) && !isDefined(pendingQuestionPart)) {
      this.logAssistantTurnWithoutText({
        responseMessage,
        isAborted,
        streamError,
        outOfCredits,
        hasText,
        threadId,
        workspaceId,
        streamUsage,
        modelId: modelConfig.modelId,
      });
    }

    if (responseMessage.parts.length === 0) {
      return;
    }

    const threadStatus = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
      select: ['id', 'deletedAt'],
    });

    if (!threadStatus || threadStatus.deletedAt) {
      return;
    }

    const userMessage = await userMessagePromise;

    if (isDefined(userMessage.turnId)) {
      await this.agentChatService.upsertAssistantMessage({
        id: assistantMessageId,
        threadId,
        turnId: userMessage.turnId,
        parts: responseMessage.parts,
        workspaceId,
      });
    } else {
      await this.agentChatService.addMessage({
        threadId,
        uiMessage: responseMessage,
        id: assistantMessageId,
        workspaceId,
      });
    }

    const totalsUpdate = await this.threadRepository.update(
      workspaceId,
      { id: threadId, activeStreamId: streamId },
      {
        totalInputTokens: () =>
          `"totalInputTokens" + ${streamUsage.inputTokens}`,
        totalOutputTokens: () =>
          `"totalOutputTokens" + ${streamUsage.outputTokens}`,
        totalInputCredits: () =>
          `"totalInputCredits" + ${streamUsage.inputCredits}`,
        totalOutputCredits: () =>
          `"totalOutputCredits" + ${streamUsage.outputCredits}`,
        totalCacheReadTokens: () =>
          `"totalCacheReadTokens" + ${streamUsage.cacheReadTokens}`,
        totalCacheCreationTokens: () =>
          `"totalCacheCreationTokens" + ${totalCacheCreationTokens}`,
        contextWindowTokens: modelConfig.contextWindowTokens,
        conversationSize: lastStepConversationSize,
        pendingQuestionMessageId: isDefined(pendingQuestionPart)
          ? assistantMessageId
          : null,
        lastStreamError: null,
      },
    );

    if (!totalsUpdate.affected) {
      return;
    }

    if (hasText && !isAborted && !isDefined(pendingQuestionPart)) {
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AiChatTurnCompleted,
        amount: 1,
        attributes: { model: modelConfig.modelId },
      });
    }

    await this.agentChatService.notifyThreadUsageUpdated({
      threadId,
      userWorkspaceId,
      workspaceId,
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
    streamUsage,
    modelId,
  }: {
    responseMessage: Omit<ExtendedUIMessage, 'id'>;
    isAborted: boolean;
    streamError: unknown;
    outOfCredits: boolean;
    hasText: boolean;
    threadId: string;
    workspaceId: string;
    streamUsage: {
      inputTokens: number;
      outputTokens: number;
    };
    modelId: string;
  }): void {
    const reason = isAborted
      ? 'user-cancelled'
      : streamError
        ? 'stream-error'
        : outOfCredits
          ? 'credits-exhausted'
          : 'empty-completion';

    if (reason === 'empty-completion') {
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AiChatTurnFailed,
        amount: 1,
        attributes: { model: modelId, failure_phase: 'no_text' },
      });
    }

    const errorDetail =
      streamError instanceof Error
        ? `${streamError.name}: ${streamError.message}`
        : isDefined(streamError)
          ? String(streamError)
          : 'none';

    this.logger.warn(
      `[AI_CHAT_NO_TEXT] Assistant turn ended without a text reply — ` +
        `reason=${reason}, threadId=${threadId}, workspaceId=${workspaceId}, ` +
        `isAborted=${isAborted}, outOfCredits=${outOfCredits}, hasText=${hasText}, ` +
        `streamError=${errorDetail}, ` +
        `inputTokens=${streamUsage.inputTokens},` +
        `responseMessage.parts=${JSON.stringify(responseMessage.parts)}`,
    );

    if (streamError instanceof Error && isDefined(streamError.stack)) {
      this.logger.warn(
        `[AI_CHAT_NO_TEXT] streamError stack — threadId=${threadId}: ${streamError.stack}`,
      );
    }
  }
}
