import { Logger, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  createUIMessageStream,
  JsonToSseTransformStream,
  type UIMessageStreamWriter,
} from 'ai';
import type {
  ExtendedUIMessage,
  ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import { Repository } from 'typeorm';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import type { BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsingContext.type';
import { computeCostBreakdown } from 'src/engine/metadata-modules/ai/ai-billing/utils/compute-cost-breakdown.util';
import { convertDollarsToBillingCredits } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-billing-credits.util';
import { extractCacheCreationTokens } from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import type { AIModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatResumableStreamService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-resumable-stream.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { ChatExecutionService } from 'src/engine/metadata-modules/ai/ai-chat/services/chat-execution.service';

export const STREAM_AGENT_CHAT_JOB_NAME = 'StreamAgentChatJob';

export type StreamAgentChatJobData = {
  threadId: string;
  streamId: string;
  userWorkspaceId: string;
  workspaceId: string;
  messages: ExtendedUIMessage[];
  browsingContext: BrowsingContextType | null;
  modelId?: string;
  lastUserMessageText: string;
  lastUserMessageParts: ExtendedUIMessagePart[];
};

// Channel name used for cross-instance stream cancellation via Redis pub/sub.
// The DELETE endpoint publishes to this channel; the running job subscribes
// and aborts the LLM connection when a message arrives.
const getCancelChannel = (threadId: string) =>
  `ai-stream:cancel:${threadId}`;

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
    private readonly resumableStreamService: AgentChatResumableStreamService,
    private readonly redisClientService: RedisClientService,
  ) {}

  @Process(STREAM_AGENT_CHAT_JOB_NAME)
  async handle(data: StreamAgentChatJobData): Promise<void> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: data.workspaceId },
    });

    if (!workspace) {
      this.logger.error(`Workspace ${data.workspaceId} not found`);

      return;
    }

    // Set up cross-instance cancellation: subscribe to a Redis channel
    // so any pod can cancel this stream by publishing to it.
    const abortController = new AbortController();
    const cancelChannel = getCancelChannel(data.threadId);
    const subscriber = this.redisClientService.getClient().duplicate();

    await subscriber.subscribe(cancelChannel);
    subscriber.on('message', (channel: string) => {
      if (channel === cancelChannel) {
        abortController.abort();
      }
    });

    try {
      await this.executeStream(data, workspace, abortController.signal);
    } finally {
      await subscriber.unsubscribe(cancelChannel).catch(() => {});
      await subscriber.quit().catch(() => {});
    }
  }

  private async executeStream(
    data: StreamAgentChatJobData,
    workspace: WorkspaceEntity,
    abortSignal: AbortSignal,
  ): Promise<void> {
    // Save user message (same as the old streaming service did).
    // We need the turnId in onFinish to associate the assistant message.
    const userMessagePromise = this.agentChatService.addMessage({
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

    // Title generation runs in parallel with the LLM stream
    const thread = await this.threadRepository.findOne({
      where: { id: data.threadId },
    });

    const titlePromise =
      thread?.title
        ? Promise.resolve(null)
        : this.agentChatService
            .generateTitleIfNeeded(data.threadId, data.lastUserMessageText)
            .catch(() => null);

    const { stream, modelConfig } =
      await this.chatExecutionService.streamChat({
        workspace,
        userWorkspaceId: data.userWorkspaceId,
        messages: data.messages,
        browsingContext: data.browsingContext,
        modelId: data.modelId,
        abortSignal,
      });

    // Build the UIMessageStream (same logic as the old AgentChatStreamingService)
    // and pipe it into the Redis resumable stream.
    await this.buildAndPipeStream({
      stream,
      modelConfig,
      threadId: data.threadId,
      streamId: data.streamId,
      userMessagePromise,
      titlePromise,
    });
  }

  private async buildAndPipeStream({
    stream,
    modelConfig,
    threadId,
    streamId,
    userMessagePromise,
    titlePromise,
  }: {
    stream: ReturnType<
      typeof import('ai').streamText
    >;
    modelConfig: AIModelConfig;
    threadId: string;
    streamId: string;
    userMessagePromise: Promise<{ turnId: string }>;
    titlePromise: Promise<string | null>;
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

      const uiStream = createUIMessageStream<ExtendedUIMessage>({
        execute: async ({ writer }) => {
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
                    threadId,
                    streamUsage,
                    lastStepConversationSize,
                    modelConfig,
                    userMessagePromise,
                    titlePromise,
                    writer,
                  });
                  resolve();
                } catch (error) {
                  reject(error);
                }
              },
              sendReasoning: true,
            }),
          );
        },
      });

      // Convert UIMessageChunks to SSE-formatted strings and write into
      // Redis via the resumable stream. The API server reads these SSE
      // strings and pipes them directly to the client's HTTP response.
      const sseStream = uiStream.pipeThrough(new JsonToSseTransformStream());

      this.resumableStreamService
        .createResumableStream(streamId, () => sseStream)
        .catch(reject);
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
    part: { type: string; usage?: { inputTokens?: number; inputTokenDetails?: { cacheReadTokens?: number } }; totalUsage?: { inputTokens?: number; outputTokens?: number; inputTokenDetails?: { cacheReadTokens?: number }; outputTokenDetails?: { reasoningTokens?: number } }; providerMetadata?: Record<string, Record<string, unknown> | undefined> };
    modelConfig: AIModelConfig;
    lastStepConversationSize: number;
    totalCacheCreationTokens: number;
    onUpdateUsage: (usage: { inputTokens: number; outputTokens: number; inputCredits: number; outputCredits: number }) => void;
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
        reasoningTokens:
          part.totalUsage?.outputTokenDetails?.reasoningTokens,
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
    titlePromise,
    writer,
  }: {
    responseMessage: Omit<ExtendedUIMessage, 'id'>;
    threadId: string;
    streamUsage: { inputTokens: number; outputTokens: number; inputCredits: number; outputCredits: number };
    lastStepConversationSize: number;
    modelConfig: AIModelConfig;
    userMessagePromise: Promise<{ turnId: string }>;
    titlePromise: Promise<string | null>;
    writer: UIMessageStreamWriter<ExtendedUIMessage>;
  }): Promise<void> {
    if (responseMessage.parts.length === 0) {
      await this.threadRepository.update(threadId, {
        activeStreamId: null,
      });

      return;
    }

    const userMessage = await userMessagePromise;

    await this.agentChatService.addMessage({
      threadId,
      uiMessage: responseMessage,
      turnId: userMessage.turnId,
    });

    await this.threadRepository.update(threadId, {
      totalInputTokens: () =>
        `"totalInputTokens" + ${streamUsage.inputTokens}`,
      totalOutputTokens: () =>
        `"totalOutputTokens" + ${streamUsage.outputTokens}`,
      totalInputCredits: () =>
        `"totalInputCredits" + ${streamUsage.inputCredits}`,
      totalOutputCredits: () =>
        `"totalOutputCredits" + ${streamUsage.outputCredits}`,
      contextWindowTokens: modelConfig.contextWindowTokens,
      conversationSize: lastStepConversationSize,
      activeStreamId: null,
    });

    const generatedTitle = await titlePromise;

    if (generatedTitle) {
      writer.write({
        type: 'data-thread-title' as const,
        id: `thread-title-${threadId}`,
        data: { title: generatedTitle },
      });
    }
  }
}

// Re-export the cancel channel helper so the controller can publish to it.
export { getCancelChannel };
