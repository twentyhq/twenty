import { Logger, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { createUIMessageStream } from 'ai';
import type {
  CodeExecutionData,
  ExtendedUIMessage,
  ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import { Repository } from 'typeorm';

import { AgentChatCancelSubscriberService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-cancel-subscriber.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { computeCostBreakdown } from 'src/engine/metadata-modules/ai/ai-billing/utils/compute-cost-breakdown.util';
import { convertDollarsToBillingCredits } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-billing-credits.util';
import { extractCacheCreationTokens } from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import type { AIModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { ChatExecutionService } from 'src/engine/metadata-modules/ai/ai-chat/services/chat-execution.service';
import { getCancelChannel } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-cancel-channel.util';

import { STREAM_AGENT_CHAT_JOB_NAME } from './stream-agent-chat-job-name.constant';
import { type StreamAgentChatJobData } from './stream-agent-chat-job.types';

export { STREAM_AGENT_CHAT_JOB_NAME, type StreamAgentChatJobData };

@Processor({ queueName: MessageQueue.aiStreamQueue, scope: Scope.REQUEST })
export class StreamAgentChatJob {
  private readonly logger = new Logger(StreamAgentChatJob.name);

  constructor(
    @InjectRepository(AgentChatThreadEntity)
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly chatExecutionService: ChatExecutionService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly cancelSubscriberService: AgentChatCancelSubscriberService,
    private readonly agentChatStreamingService: AgentChatStreamingService,
  ) {}

  @Process(STREAM_AGENT_CHAT_JOB_NAME)
  async handle(data: StreamAgentChatJobData): Promise<void> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: data.workspaceId },
    });

    if (!workspace) {
      this.logger.error(`Workspace ${data.workspaceId} not found`);
      await this.eventPublisherService.publish({
        threadId: data.threadId,
        workspaceId: data.workspaceId,
        event: {
          type: 'stream-error',
          code: 'WORKSPACE_NOT_FOUND',
          message: `Workspace ${data.workspaceId} not found`,
        },
      });

      return;
    }

    const abortController = new AbortController();
    const cancelChannel = getCancelChannel(data.threadId);

    await this.cancelSubscriberService.subscribe(cancelChannel, () => {
      abortController.abort();
    });

    try {
      await this.executeStream(data, workspace, abortController.signal);
    } catch (error) {
      this.logger.error(
        `Stream ${data.streamId} failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      await this.eventPublisherService
        .publish({
          threadId: data.threadId,
          workspaceId: data.workspaceId,
          event: {
            type: 'stream-error',
            code: 'STREAM_EXECUTION_FAILED',
            message:
              error instanceof Error
                ? error.message
                : 'Stream execution failed',
          },
        })
        .catch(() => {});
    } finally {
      await this.cancelSubscriberService.unsubscribe(cancelChannel);
      await this.threadRepository
        .createQueryBuilder()
        .update(AgentChatThreadEntity)
        .set({ activeStreamId: null })
        .where('id = :id AND "activeStreamId" = :streamId', {
          id: data.threadId,
          streamId: data.streamId,
        })
        .execute()
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
    return new Promise<void>((resolve, reject) => {
      let streamUsage = {
        inputTokens: 0,
        outputTokens: 0,
        inputCredits: 0,
        outputCredits: 0,
      };
      let lastStepConversationSize = 0;
      let totalCacheCreationTokens = 0;

      // onFinish fires before the uiStream is fully drained. We use this
      // promise to coordinate: the IIFE waits for DB persist to complete
      // before publishing message-persisted (after all chunks).
      let resolveStreamFinished: () => void;
      const streamFinishedPromise = new Promise<void>((res) => {
        resolveStreamFinished = res;
      });

      abortSignal.addEventListener('abort', () => resolve(), { once: true });

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

          const { stream, modelConfig } =
            await this.chatExecutionService.streamChat({
              workspace,
              userWorkspaceId: data.userWorkspaceId,
              messages: data.messages,
              browsingContext: data.browsingContext,
              modelId: data.modelId,
              onCodeExecutionUpdate,
              abortSignal,
            });

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
                return error instanceof Error ? error.message : String(error);
              },
              sendStart: false,
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
              onFinish: async ({ responseMessage }) => {
                try {
                  await this.handleStreamFinish({
                    responseMessage,
                    threadId: data.threadId,
                    streamUsage,
                    lastStepConversationSize,
                    modelConfig,
                    userMessagePromise,
                  });
                  await titleWritePromise;
                  resolveStreamFinished();
                } catch (error) {
                  reject(error);
                }
              },
              sendReasoning: true,
            }),
          );
        },
      });

      // Publish all chunks first, then signal completion. This guarantees
      // message-persisted arrives after every stream-chunk on the client.
      (async () => {
        try {
          for await (const chunk of uiStream) {
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

          await this.eventPublisherService.publish({
            threadId: data.threadId,
            workspaceId: data.workspaceId,
            event: { type: 'message-persisted', messageId: data.threadId },
          });

          resolve();
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
        inputTokenDetails?: { cacheReadTokens?: number };
      };
      totalUsage?: {
        inputTokens?: number;
        outputTokens?: number;
        inputTokenDetails?: { cacheReadTokens?: number };
        outputTokenDetails?: { reasoningTokens?: number };
      };
      providerMetadata?: Record<string, Record<string, unknown> | undefined>;
    };
    modelConfig: AIModelConfig;
    lastStepConversationSize: number;
    totalCacheCreationTokens: number;
    onUpdateUsage: (usage: {
      inputTokens: number;
      outputTokens: number;
      inputCredits: number;
      outputCredits: number;
    }) => void;
    onUpdateConversationSize: (size: number) => void;
    onUpdateCacheCreationTokens: (tokens: number) => void;
  }) {
    if (part.type === 'finish-step') {
      const stepInput = part.usage?.inputTokens ?? 0;
      const stepCached = part.usage?.inputTokenDetails?.cacheReadTokens ?? 0;
      const stepCacheCreation = extractCacheCreationTokens(
        part.providerMetadata,
      );

      onUpdateCacheCreationTokens(totalCacheCreationTokens + stepCacheCreation);
      onUpdateConversationSize(stepInput + stepCached + stepCacheCreation);
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
    responseMessage,
    threadId,
    streamUsage,
    lastStepConversationSize,
    modelConfig,
    userMessagePromise,
  }: {
    responseMessage: Omit<ExtendedUIMessage, 'id'>;
    threadId: string;
    streamUsage: {
      inputTokens: number;
      outputTokens: number;
      inputCredits: number;
      outputCredits: number;
    };
    lastStepConversationSize: number;
    modelConfig: AIModelConfig;
    userMessagePromise: Promise<{ turnId: string | null }>;
  }): Promise<void> {
    if (responseMessage.parts.length === 0) {
      return;
    }

    const userMessage = await userMessagePromise;

    await this.agentChatService.addMessage({
      threadId,
      uiMessage: responseMessage,
      turnId: userMessage.turnId ?? undefined,
    });

    await this.threadRepository.update(threadId, {
      totalInputTokens: () => `"totalInputTokens" + ${streamUsage.inputTokens}`,
      totalOutputTokens: () =>
        `"totalOutputTokens" + ${streamUsage.outputTokens}`,
      totalInputCredits: () =>
        `"totalInputCredits" + ${streamUsage.inputCredits}`,
      totalOutputCredits: () =>
        `"totalOutputCredits" + ${streamUsage.outputCredits}`,
      contextWindowTokens: modelConfig.contextWindowTokens,
      conversationSize: lastStepConversationSize,
    });
  }
}
