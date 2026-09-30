import { type LanguageModelUsage, type TextStreamPart, type ToolSet } from 'ai';
import { ASK_QUESTIONS_TOOL_NAME } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { StreamAgentChatJob } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat.job';
import { type StreamAgentChatJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job.types';
import { type AiModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

type PublishedEvent = { type: string } & Record<string, unknown>;

type ModelStreamPart = TextStreamPart<ToolSet>;

const USAGE: LanguageModelUsage = {
  inputTokens: 12,
  inputTokenDetails: {
    noCacheTokens: 12,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
  },
  outputTokens: 3,
  outputTokenDetails: { textTokens: 3, reasoningTokens: 0 },
  totalTokens: 15,
};

const START_PARTS: ModelStreamPart[] = [
  { type: 'start' },
  { type: 'start-step', request: {}, warnings: [] },
];

const buildFinishStepPart = (usage: LanguageModelUsage): ModelStreamPart => ({
  type: 'finish-step',
  response: {
    id: 'response-id',
    timestamp: new Date(0),
    modelId: 'gpt-5.6-luna',
  },
  usage,
  performance: {
    effectiveOutputTokensPerSecond: 0,
    outputTokensPerSecond: undefined,
    inputTokensPerSecond: undefined,
    effectiveTotalTokensPerSecond: 0,
    stepTimeMs: 0,
    responseTimeMs: 0,
    timeToFirstOutputMs: 0,
    toolExecutionMs: {},
  },
  finishReason: 'stop',
  rawFinishReason: undefined,
  providerMetadata: undefined,
});

const buildFinishPart = (totalUsage: LanguageModelUsage): ModelStreamPart => ({
  type: 'finish',
  finishReason: 'stop',
  rawFinishReason: undefined,
  totalUsage,
});

const FINISH_PARTS: ModelStreamPart[] = [
  buildFinishStepPart(USAGE),
  buildFinishPart(USAGE),
];

const TEXT_PARTS: ModelStreamPart[] = [
  ...START_PARTS,
  { type: 'text-start', id: 'text-1' },
  { type: 'text-delta', id: 'text-1', text: 'Hello' },
  { type: 'text-end', id: 'text-1' },
  ...FINISH_PARTS,
];

const EMPTY_REPLY_PARTS: ModelStreamPart[] = [...START_PARTS, ...FINISH_PARTS];

const QUESTIONS = [
  {
    header: 'Plan',
    question: 'Which plan?',
    options: [{ label: 'Pro' }, { label: 'Team' }],
  },
];

const PENDING_QUESTION_PARTS: ModelStreamPart[] = [
  ...START_PARTS,
  {
    type: 'tool-input-start',
    id: 'tool-call-id',
    toolName: ASK_QUESTIONS_TOOL_NAME,
  },
  {
    type: 'tool-call',
    toolCallId: 'tool-call-id',
    toolName: ASK_QUESTIONS_TOOL_NAME,
    input: { questions: QUESTIONS },
  },
  {
    type: 'tool-result',
    toolCallId: 'tool-call-id',
    toolName: ASK_QUESTIONS_TOOL_NAME,
    input: { questions: QUESTIONS },
    output: { result: { questions: QUESTIONS, status: 'pending' } },
  },
  ...FINISH_PARTS,
];

const createFakeChatStream = ({
  parts = TEXT_PARTS,
  midStreamError,
  onFirstPart,
  isAborted = false,
}: {
  parts?: ModelStreamPart[];
  midStreamError?: Error;
  onFirstPart?: () => void;
  isAborted?: boolean;
} = {}) => ({
  stream: new ReadableStream<ModelStreamPart>(
    {
      pull(controller) {
        parts.forEach((part, index) => {
          controller.enqueue(part);

          if (index === 0) {
            onFirstPart?.();
          }
        });

        if (midStreamError) {
          controller.enqueue({ type: 'error', error: midStreamError });
        }

        if (isAborted) {
          controller.enqueue({ type: 'abort' });
        }

        controller.close();
      },
    },
    // Produced on the first read, so the tests' triggers fire while the job is streaming.
    { highWaterMark: 0 },
  ),
});

describe('StreamAgentChatJob', () => {
  const workspace = {
    id: 'workspace-id',
    aiChatModelTier: 'smart',
    aiAgentModelTier: 'smart',
    isAutoModelSelectionEnabled: true,
    aiModelIdByTier: {},
  } as WorkspaceEntity;

  const jobData: StreamAgentChatJobData = {
    threadId: 'thread-id',
    streamId: 'stream-id',
    userWorkspaceId: 'user-workspace-id',
    workspaceId: 'workspace-id',
    messages: [],
    browsingContext: null,
    lastUserMessageText: 'hello',
    hasTitle: true,
    conversationSizeTokens: 0,
    existingTurnId: 'turn-id',
  };

  const buildJob = ({
    workspaceFound = true,
    chatStream = createFakeChatStream(),
    streamChatRejection,
    assistantPersistRejection,
    totalsUpdateAffected = 1,
    finalPublishRejection,
    modelConfig = {
      contextWindowTokens: 100000,
      inputCostPerMillionTokens: 1,
      outputCostPerMillionTokens: 2,
    },
    inputAskOpenRejection,
  }: {
    inputAskOpenRejection?: Error;
    workspaceFound?: boolean;
    chatStream?: ReturnType<typeof createFakeChatStream>;
    streamChatRejection?: Error;
    assistantPersistRejection?: Error;
    totalsUpdateAffected?: number;
    finalPublishRejection?: Error;
    modelConfig?: Partial<AiModelConfig>;
  } = {}) => {
    const publishedEvents: PublishedEvent[] = [];

    const threadUsageQuery = jest.fn(async () =>
      Array.from({ length: totalsUpdateAffected }, () => ({
        id: 'thread-id',
      })),
    );
    const threadRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'thread-id',
        deletedAt: null,
        activeStreamId: 'stream-id',
      }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      query: jest.fn().mockImplementation(async (_workspaceId, work) =>
        work({
          storage: 'core',
          table: () => 'core."agentChatThread"',
          manager: { query: threadUsageQuery },
        }),
      ),
    };
    const workspaceRepository = {
      findOne: jest.fn().mockResolvedValue(workspaceFound ? workspace : null),
    };
    const agentChatService = {
      addMessage: jest.fn(),
      upsertAssistantMessage: assistantPersistRejection
        ? jest.fn().mockRejectedValue(assistantPersistRejection)
        : jest.fn().mockResolvedValue(undefined),
      generateTitleIfNeeded: jest.fn().mockResolvedValue(null),
      notifyThreadUsageUpdated: jest.fn().mockResolvedValue(undefined),
    };
    const chatExecutionService = {
      streamChat: streamChatRejection
        ? jest.fn().mockRejectedValue(streamChatRejection)
        : jest.fn().mockResolvedValue({
            stream: chatStream,
            modelConfig,
            hasNoMoreAvailableCredits: () => false,
          }),
    };
    const eventPublisherService = {
      resetStreamState: jest.fn().mockResolvedValue(undefined),
      publish: jest
        .fn()
        .mockImplementation(({ event }: { event: PublishedEvent }) => {
          if (
            isDefined(finalPublishRejection) &&
            event.type === 'message-persisted'
          ) {
            return Promise.reject(finalPublishRejection);
          }

          publishedEvents.push(event);

          return Promise.resolve();
        }),
    };
    const cancelCallbacks: Array<() => void> = [];
    const cancelSubscriberService = {
      subscribe: jest
        .fn()
        .mockImplementation((_channel: string, callback: () => void) => {
          cancelCallbacks.push(callback);

          return Promise.resolve();
        }),
      unsubscribe: jest.fn().mockResolvedValue(undefined),
    };
    const agentChatStreamingService = {
      flushNextQueuedMessage: jest.fn().mockResolvedValue(undefined),
    };
    const streamHeartbeatService = {
      startRunning: jest.fn().mockReturnValue(() => {}),
      markClaimed: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    };
    const metricsService = { incrementCounterBy: jest.fn() };
    const aiModelRegistryService = {
      getEffectiveModelConfig: jest
        .fn()
        .mockReturnValue({ modelId: 'openai/gpt-5.6-luna' }),
    };
    const actorService = {
      authorizeJob: jest.fn().mockResolvedValue({
        authorization: { authContext: { workspaceMemberId: 'member' } },
        message: { id: 'user-message-id', turnId: 'turn-id' },
      }),
    };
    const inputAskWorkspaceService = {
      open: inputAskOpenRejection
        ? jest.fn().mockRejectedValue(inputAskOpenRejection)
        : jest.fn().mockResolvedValue(undefined),
      cancel: jest.fn().mockResolvedValue(true),
    };
    const job = new StreamAgentChatJob(
      threadRepository as never,
      workspaceRepository as never,
      agentChatService as never,
      chatExecutionService as never,
      eventPublisherService as never,
      cancelSubscriberService as never,
      agentChatStreamingService as never,
      streamHeartbeatService as never,
      metricsService as never,
      aiModelRegistryService as never,
      actorService as never,
      inputAskWorkspaceService as never,
    );

    const turnCounts = (key: string) =>
      metricsService.incrementCounterBy.mock.calls
        .map(([call]) => call)
        .filter((call: { key: string }) => call.key === key);

    return {
      job,
      actorService,
      chatExecutionService,
      publishedEvents,
      threadRepository,
      threadUsageQuery,
      agentChatService,
      eventPublisherService,
      agentChatStreamingService,
      cancelCallbacks,
      metricsService,
      aiModelRegistryService,
      inputAskWorkspaceService,
      turnCounts,
    };
  };

  it('uses the persisted turn when a job supplies only its message ID', async () => {
    const { job, agentChatService, chatExecutionService } = buildJob();
    await job.handle({
      ...jobData,
      messageId: 'user-message-id',
      existingTurnId: undefined,
    });
    expect(agentChatService.addMessage).not.toHaveBeenCalled();
    expect(chatExecutionService.streamChat).toHaveBeenCalledWith(
      expect.objectContaining({
        messageId: 'user-message-id',
        turnId: 'turn-id',
      }),
    );
    expect(agentChatService.upsertAssistantMessage).toHaveBeenCalledWith(
      expect.objectContaining({ turnId: 'turn-id' }),
    );
  });

  it('rejects a persisted message without a turn instead of creating another message', async () => {
    const { job, actorService, agentChatService, chatExecutionService } =
      buildJob();
    actorService.authorizeJob.mockResolvedValue({
      message: { id: 'user-message-id', turnId: null },
    } as never);
    await expect(job.handle(jobData)).rejects.toMatchObject({
      code: 'MESSAGE_NOT_FOUND',
    });
    expect(agentChatService.addMessage).not.toHaveBeenCalled();
    expect(chatExecutionService.streamChat).not.toHaveBeenCalled();
  });

  it('does not invoke the model when the saved sender lost access before execution', async () => {
    const { job, actorService, chatExecutionService, threadRepository } =
      buildJob();
    actorService.authorizeJob.mockRejectedValue(
      new Error('Sender access revoked'),
    );
    await expect(job.handle(jobData)).rejects.toThrow('Sender access revoked');
    expect(chatExecutionService.streamChat).not.toHaveBeenCalled();
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: 'stream-id' },
      { activeStreamId: null },
    );
  });

  it('publishes all chunks in order with message-persisted last on success', async () => {
    const {
      job,
      publishedEvents,
      threadRepository,
      agentChatService,
      agentChatStreamingService,
    } = buildJob();

    await job.handle(jobData);

    const chunkEvents = publishedEvents.filter(
      (event) => event.type === 'stream-chunk',
    );

    expect(
      chunkEvents.map((event) => (event.chunk as { type: string }).type),
    ).toEqual(TEXT_PARTS.map((part) => part.type));
    expect(publishedEvents[publishedEvents.length - 1]).toMatchObject({
      type: 'message-persisted',
    });
    expect(agentChatService.upsertAssistantMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        turnId: 'turn-id',
        parts: expect.arrayContaining([
          expect.objectContaining({ type: 'text' }),
        ]),
      }),
    );
    expect(threadRepository.query).toHaveBeenCalledWith(
      'workspace-id',
      expect.any(Function),
    );
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: 'stream-id' },
      { activeStreamId: null },
    );
    expect(agentChatStreamingService.flushNextQueuedMessage).toHaveBeenCalled();
  });

  it('gates the thread totals on still owning the stream so a prior completion is not double-counted', async () => {
    const { job, agentChatService, threadRepository } = buildJob({
      totalsUpdateAffected: 0,
    });

    await job.handle(jobData);

    expect(agentChatService.upsertAssistantMessage).toHaveBeenCalledWith(
      expect.objectContaining({ turnId: 'turn-id' }),
    );
    expect(threadRepository.query).toHaveBeenCalledWith(
      'workspace-id',
      expect.any(Function),
    );
    expect(agentChatService.notifyThreadUsageUpdated).not.toHaveBeenCalled();
  });

  it('prices each step on its own, so steps under the long-context threshold never reach its rate together', async () => {
    const stepUsage: LanguageModelUsage = {
      inputTokens: 150_000,
      inputTokenDetails: {
        noCacheTokens: 150_000,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      },
      outputTokens: 1_000,
      outputTokenDetails: { textTokens: 1_000, reasoningTokens: 0 },
      totalTokens: 151_000,
    };
    const turnUsage: LanguageModelUsage = {
      inputTokens: 300_000,
      inputTokenDetails: {
        noCacheTokens: 300_000,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      },
      outputTokens: 2_000,
      outputTokenDetails: { textTokens: 2_000, reasoningTokens: 0 },
      totalTokens: 302_000,
    };
    const { job, threadUsageQuery } = buildJob({
      chatStream: createFakeChatStream({
        parts: [
          ...START_PARTS,
          { type: 'text-start', id: 'text-1' },
          { type: 'text-delta', id: 'text-1', text: 'Hello' },
          { type: 'text-end', id: 'text-1' },
          buildFinishStepPart(stepUsage),
          { type: 'start-step', request: {}, warnings: [] },
          buildFinishStepPart(stepUsage),
          buildFinishPart(turnUsage),
        ],
      }),
      modelConfig: {
        contextWindowTokens: 1_000_000,
        inputCostPerMillionTokens: 1,
        outputCostPerMillionTokens: 2,
        longContextCost: {
          inputCostPerMillionTokens: 10,
          outputCostPerMillionTokens: 20,
          thresholdTokens: 200_000,
        },
      },
    });

    await job.handle(jobData);

    const [, [, , inputTokens, outputTokens, inputCredits, outputCredits]] =
      threadUsageQuery.mock.calls[0] as unknown as [string, number[]];

    expect({ inputTokens, outputTokens, inputCredits, outputCredits }).toEqual({
      inputTokens: 300_000,
      outputTokens: 2_000,
      inputCredits: 300_000,
      outputCredits: 4_000,
    });
  });

  it('applies thread totals when the claim is still held even if the message already exists from a checkpoint', async () => {
    const { job, agentChatService } = buildJob({ totalsUpdateAffected: 1 });

    await job.handle(jobData);

    expect(agentChatService.upsertAssistantMessage).toHaveBeenCalled();
    expect(agentChatService.notifyThreadUsageUpdated).toHaveBeenCalled();
  });

  it('never publishes the opaque error chunk to subscribers', async () => {
    const { job, publishedEvents } = buildJob({
      chatStream: createFakeChatStream({
        midStreamError: new Error('provider exploded'),
      }),
    });

    await expect(job.handle(jobData)).rejects.toThrow('provider exploded');

    const chunkTypes = publishedEvents
      .filter((event) => event.type === 'stream-chunk')
      .map((event) => (event.chunk as { type: string }).type);

    expect(chunkTypes).not.toContain('error');
  });

  it('rejects, persists the error, and unblocks the thread when the model stream fails mid-stream', async () => {
    const { job, publishedEvents, threadRepository } = buildJob({
      chatStream: createFakeChatStream({
        midStreamError: new Error('provider exploded'),
      }),
    });

    await expect(job.handle(jobData)).rejects.toThrow('provider exploded');

    const chunkEvents = publishedEvents.filter(
      (event) => event.type === 'stream-chunk',
    );

    expect(chunkEvents).toHaveLength(TEXT_PARTS.length);
    expect(publishedEvents[publishedEvents.length - 2]).toMatchObject({
      type: 'stream-error',
      code: 'STREAM_EXECUTION_FAILED',
      message: 'provider exploded',
    });
    expect(publishedEvents[publishedEvents.length - 1]).toMatchObject({
      type: 'queue-updated',
    });
    expect(publishedEvents.map((event) => event.type)).not.toContain(
      'message-persisted',
    );
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: 'stream-id' },
      {
        lastStreamError: expect.objectContaining({
          code: 'STREAM_EXECUTION_FAILED',
          message: 'provider exploded',
        }),
      },
    );
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: 'stream-id' },
      { activeStreamId: null },
    );
  });

  it('rejects promptly when execution setup throws instead of hanging until the queue lock expires', async () => {
    const { job, publishedEvents, threadRepository } = buildJob({
      streamChatRejection: new Error('model resolution failed'),
    });

    await expect(job.handle(jobData)).rejects.toThrow(
      'model resolution failed',
    );

    expect(publishedEvents[publishedEvents.length - 2]).toMatchObject({
      type: 'stream-error',
      message: 'model resolution failed',
    });
    expect(publishedEvents[publishedEvents.length - 1]).toMatchObject({
      type: 'queue-updated',
    });
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: 'stream-id' },
      { activeStreamId: null },
    );
  });

  it('terminates the stream with an error when assistant persistence fails after draining chunks', async () => {
    const { job, publishedEvents } = buildJob({
      assistantPersistRejection: new Error('insert failed'),
    });

    await expect(job.handle(jobData)).rejects.toThrow('insert failed');

    const chunkEvents = publishedEvents.filter(
      (event) => event.type === 'stream-chunk',
    );

    expect(chunkEvents).toHaveLength(TEXT_PARTS.length);
    expect(publishedEvents[publishedEvents.length - 2]).toMatchObject({
      type: 'stream-error',
    });
    expect(publishedEvents[publishedEvents.length - 1]).toMatchObject({
      type: 'queue-updated',
    });
    expect(publishedEvents.map((event) => event.type)).not.toContain(
      'message-persisted',
    );
  });

  it('persists the error and unblocks the thread when the workspace is missing', async () => {
    const { job, publishedEvents, threadRepository } = buildJob({
      workspaceFound: false,
    });

    await expect(job.handle(jobData)).rejects.toMatchObject({
      code: AiExceptionCode.WORKSPACE_NOT_FOUND,
    });

    expect(publishedEvents[publishedEvents.length - 2]).toMatchObject({
      type: 'stream-error',
      code: AiExceptionCode.WORKSPACE_NOT_FOUND,
    });
    expect(publishedEvents[publishedEvents.length - 1]).toMatchObject({
      type: 'queue-updated',
    });
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: 'stream-id' },
      {
        lastStreamError: expect.objectContaining({
          code: AiExceptionCode.WORKSPACE_NOT_FOUND,
        }),
      },
    );
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: 'stream-id' },
      { activeStreamId: null },
    );
  });

  it('bails out without streaming when the thread no longer holds the claim for this stream', async () => {
    const {
      job,
      publishedEvents,
      threadRepository,
      eventPublisherService,
      agentChatStreamingService,
    } = buildJob();

    threadRepository.findOne.mockResolvedValueOnce({
      id: 'thread-id',
      deletedAt: null,
      activeStreamId: 'newer-stream-id',
    });

    await job.handle(jobData);

    expect(publishedEvents).toHaveLength(0);
    expect(eventPublisherService.resetStreamState).not.toHaveBeenCalled();
    expect(threadRepository.update).not.toHaveBeenCalled();
    expect(
      agentChatStreamingService.flushNextQueuedMessage,
    ).not.toHaveBeenCalled();
  });

  it('bails out without streaming when the thread was deleted', async () => {
    const { job, publishedEvents, threadRepository, eventPublisherService } =
      buildJob();

    threadRepository.findOne.mockResolvedValueOnce(null);

    await job.handle(jobData);

    expect(publishedEvents).toHaveLength(0);
    expect(eventPublisherService.resetStreamState).not.toHaveBeenCalled();
    expect(threadRepository.update).not.toHaveBeenCalled();
  });

  it('persists the interrupted error and publishes the terminal sequence when aborted by a worker shutdown', async () => {
    let triggerShutdown: (() => void) | undefined;

    const {
      job,
      publishedEvents,
      threadRepository,
      agentChatStreamingService,
    } = buildJob({
      chatStream: createFakeChatStream({
        onFirstPart: () => triggerShutdown?.(),
      }),
    });

    const shutdownController = new AbortController();

    triggerShutdown = () => shutdownController.abort();

    await expect(
      job.handle(jobData, { abortSignal: shutdownController.signal }),
    ).rejects.toMatchObject({ code: AiExceptionCode.STREAM_INTERRUPTED });

    const eventTypes = publishedEvents.map((event) => event.type);
    const streamErrorIndex = eventTypes.indexOf('stream-error');
    const queueUpdatedIndex = eventTypes.indexOf('queue-updated');

    expect(publishedEvents[streamErrorIndex]).toMatchObject({
      type: 'stream-error',
      code: AiExceptionCode.STREAM_INTERRUPTED,
    });
    expect(queueUpdatedIndex).toBeGreaterThan(streamErrorIndex);
    expect(eventTypes).not.toContain('message-persisted');
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: 'stream-id' },
      {
        lastStreamError: expect.objectContaining({
          code: AiExceptionCode.STREAM_INTERRUPTED,
        }),
      },
    );
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: 'stream-id' },
      { activeStreamId: null },
    );
    expect(
      agentChatStreamingService.flushNextQueuedMessage,
    ).not.toHaveBeenCalled();
  });

  it('keeps user-cancel semantics when a shutdown signal is wired but never aborted', async () => {
    let triggerUserCancel: (() => void) | undefined;

    const { job, publishedEvents, agentChatStreamingService, cancelCallbacks } =
      buildJob({
        chatStream: createFakeChatStream({
          onFirstPart: () => triggerUserCancel?.(),
        }),
      });

    triggerUserCancel = () => cancelCallbacks.forEach((callback) => callback());

    const shutdownController = new AbortController();

    await job.handle(jobData, { abortSignal: shutdownController.signal });

    expect(publishedEvents.map((event) => event.type)).not.toContain(
      'stream-error',
    );
    expect(
      agentChatStreamingService.flushNextQueuedMessage,
    ).not.toHaveBeenCalled();
  });

  it('resolves without flushing the queue when the stream is cancelled', async () => {
    let triggerCancel: (() => void) | undefined;

    const {
      job,
      publishedEvents,
      agentChatService,
      agentChatStreamingService,
      cancelCallbacks,
    } = buildJob({
      chatStream: createFakeChatStream({
        onFirstPart: () => triggerCancel?.(),
      }),
    });

    triggerCancel = () => cancelCallbacks.forEach((callback) => callback());

    await job.handle(jobData);

    expect(publishedEvents.map((event) => event.type)).not.toContain(
      'stream-error',
    );
    expect(
      agentChatStreamingService.flushNextQueuedMessage,
    ).not.toHaveBeenCalled();
    expect(agentChatService.notifyThreadUsageUpdated).toHaveBeenCalled();
  });
  it('labels turn-started with the resolved model, not the auto-select id', async () => {
    const { job, aiModelRegistryService, turnCounts } = buildJob();

    await job.handle({ ...jobData, modelId: 'default-fast-model' });

    expect(aiModelRegistryService.getEffectiveModelConfig).toHaveBeenCalledWith(
      'default-fast-model',
      workspace,
    );
    expect(turnCounts('ai-chat/turn-started')).toEqual([
      expect.objectContaining({
        attributes: { model: 'openai/gpt-5.6-luna' },
      }),
    ]);
  });

  it('falls back to the workspace chat tier when the turn did not pick one', async () => {
    const { job, aiModelRegistryService } = buildJob();

    await job.handle(jobData);

    expect(aiModelRegistryService.getEffectiveModelConfig).toHaveBeenCalledWith(
      'default-smart-model',
      workspace,
    );
  });

  it('counts a text reply once, as an answered completion', async () => {
    const { job, turnCounts } = buildJob();

    await job.handle(jobData);

    expect(turnCounts('ai-chat/turn-completed')).toEqual([
      expect.objectContaining({
        attributes: { model: 'openai/gpt-5.6-luna', outcome: 'answered' },
      }),
    ]);
    expect(turnCounts('ai-chat/turn-failed')).toEqual([]);
    expect(turnCounts('ai-chat/turn-cancelled')).toEqual([]);
  });

  it('counts a turn that ended on a question as completed and awaiting the user', async () => {
    const { job, turnCounts } = buildJob({
      chatStream: createFakeChatStream({
        parts: PENDING_QUESTION_PARTS,
      }),
    });

    await job.handle(jobData);

    expect(turnCounts('ai-chat/turn-completed')).toEqual([
      expect.objectContaining({
        attributes: { model: 'openai/gpt-5.6-luna', outcome: 'awaiting_user' },
      }),
    ]);
    expect(turnCounts('ai-chat/turn-failed')).toEqual([]);
  });

  it('opens the Ask of a turn that paused on a question and leaves the queue waiting on it', async () => {
    const { job, inputAskWorkspaceService, agentChatStreamingService } =
      buildJob({
        chatStream: createFakeChatStream({ parts: PENDING_QUESTION_PARTS }),
      });

    await job.handle(jobData);

    expect(inputAskWorkspaceService.open).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      inputAsk: {
        name: 'Which plan?',
        form: { kind: 'questions', questions: QUESTIONS },
        threadId: 'thread-id',
        toolCallId: 'tool-call-id',
        assigneeId: 'member',
      },
    });
    expect(
      agentChatStreamingService.flushNextQueuedMessage,
    ).not.toHaveBeenCalled();
  });

  it('opens no Ask for a turn that did not pause', async () => {
    const { job, inputAskWorkspaceService } = buildJob();

    await job.handle(jobData);

    expect(inputAskWorkspaceService.open).not.toHaveBeenCalled();
  });

  it('fails the turn, leaving it retryable, when its Ask cannot be opened', async () => {
    const { job, publishedEvents, threadRepository, turnCounts } = buildJob({
      chatStream: createFakeChatStream({ parts: PENDING_QUESTION_PARTS }),
      inputAskOpenRejection: new Error('Ask insert failed'),
    });

    await expect(job.handle(jobData)).rejects.toThrow('Ask insert failed');

    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      { id: 'thread-id', activeStreamId: 'stream-id' },
      {
        lastStreamError: expect.objectContaining({
          message: 'Ask insert failed',
        }),
      },
    );
    expect(publishedEvents.map((event) => event.type)).toContain(
      'stream-error',
    );
    expect(turnCounts('ai-chat/turn-completed')).toEqual([]);
  });

  it('cancels the Asks it opened when a later one of the turn cannot be opened', async () => {
    const askQuestionsCallParts = (toolCallId: string): ModelStreamPart[] => [
      {
        type: 'tool-input-start',
        id: toolCallId,
        toolName: ASK_QUESTIONS_TOOL_NAME,
      },
      {
        type: 'tool-call',
        toolCallId,
        toolName: ASK_QUESTIONS_TOOL_NAME,
        input: { questions: QUESTIONS },
      },
      {
        type: 'tool-result',
        toolCallId,
        toolName: ASK_QUESTIONS_TOOL_NAME,
        input: { questions: QUESTIONS },
        output: { result: { questions: QUESTIONS, status: 'pending' } },
      },
    ];
    const { job, inputAskWorkspaceService } = buildJob({
      chatStream: createFakeChatStream({
        parts: [
          ...START_PARTS,
          ...askQuestionsCallParts('first-call-id'),
          ...askQuestionsCallParts('second-call-id'),
          ...FINISH_PARTS,
        ],
      }),
    });

    inputAskWorkspaceService.open
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Ask insert failed'));

    await expect(job.handle(jobData)).rejects.toThrow('Ask insert failed');

    expect(inputAskWorkspaceService.cancel).toHaveBeenCalledTimes(1);
    expect(inputAskWorkspaceService.cancel).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      match: { threadId: 'thread-id', toolCallId: 'first-call-id' },
    });
  });

  it('counts an aborted turn as cancelled rather than leaving it unaccounted', async () => {
    const { job, turnCounts } = buildJob({
      chatStream: createFakeChatStream({
        parts: START_PARTS,
        isAborted: true,
      }),
    });

    await job.handle(jobData);

    expect(turnCounts('ai-chat/turn-cancelled')).toEqual([
      expect.objectContaining({
        attributes: {
          model: 'openai/gpt-5.6-luna',
          reason: 'user_cancelled',
        },
      }),
    ]);
    expect(turnCounts('ai-chat/turn-completed')).toEqual([]);
  });

  it('adds the steps an aborted turn completed to the thread totals', async () => {
    const { job, threadUsageQuery } = buildJob({
      chatStream: createFakeChatStream({
        parts: [
          ...START_PARTS,
          { type: 'text-start', id: 'text-1' },
          { type: 'text-delta', id: 'text-1', text: 'Hello' },
          { type: 'text-end', id: 'text-1' },
          buildFinishStepPart(USAGE),
        ],
        isAborted: true,
      }),
    });

    await job.handle(jobData);

    const [, [, , inputTokens, outputTokens]] = threadUsageQuery.mock
      .calls[0] as unknown as [string, number[]];

    expect({ inputTokens, outputTokens }).toEqual({
      inputTokens: 12,
      outputTokens: 3,
    });
  });

  it('counts a turn whose claim moved on as superseded', async () => {
    const { job, turnCounts } = buildJob({ totalsUpdateAffected: 0 });

    await job.handle(jobData);

    expect(turnCounts('ai-chat/turn-cancelled')).toEqual([
      expect.objectContaining({
        attributes: { model: 'openai/gpt-5.6-luna', reason: 'superseded' },
      }),
    ]);
    expect(turnCounts('ai-chat/turn-completed')).toEqual([]);
  });

  it('counts an empty reply as a no_text failure exactly once', async () => {
    const { job, turnCounts } = buildJob({
      chatStream: createFakeChatStream({
        parts: EMPTY_REPLY_PARTS,
      }),
    });

    await job.handle(jobData);

    expect(turnCounts('ai-chat/turn-failed')).toEqual([
      expect.objectContaining({
        attributes: { model: 'openai/gpt-5.6-luna', failure_phase: 'no_text' },
      }),
    ]);
  });

  it('leaves a stream error to the execution counter so it is not counted twice', async () => {
    const { job, turnCounts } = buildJob({
      streamChatRejection: new Error('provider exploded'),
    });

    await job.handle(jobData).catch(() => {});

    expect(turnCounts('ai-chat/turn-failed')).toEqual([
      expect.objectContaining({
        attributes: expect.objectContaining({
          model: 'openai/gpt-5.6-luna',
          failure_phase: 'execution',
        }),
      }),
    ]);
    expect(turnCounts('ai-chat/turn-completed')).toEqual([]);
  });

  it('records exactly one outcome for every started turn', async () => {
    const scenarios = [
      buildJob(),
      buildJob({ totalsUpdateAffected: 0 }),
      buildJob({
        chatStream: createFakeChatStream({
          parts: PENDING_QUESTION_PARTS,
        }),
      }),
      buildJob({
        chatStream: createFakeChatStream({
          parts: START_PARTS,
          isAborted: true,
        }),
      }),
      buildJob({ streamChatRejection: new Error('provider exploded') }),
    ];

    for (const scenario of scenarios) {
      await scenario.job.handle(jobData).catch(() => {});

      const started = scenario.turnCounts('ai-chat/turn-started').length;
      const terminal =
        scenario.turnCounts('ai-chat/turn-completed').length +
        scenario.turnCounts('ai-chat/turn-cancelled').length +
        scenario.turnCounts('ai-chat/turn-failed').length;

      expect({ started, terminal }).toEqual({ started: 1, terminal: 1 });
    }
  });
  it('does not count a turn twice when the final publish fails after the outcome was recorded', async () => {
    const { job, turnCounts } = buildJob({
      finalPublishRejection: new Error('redis is down'),
    });

    await job.handle(jobData).catch(() => {});

    expect(turnCounts('ai-chat/turn-completed')).toEqual([
      expect.objectContaining({
        attributes: { model: 'openai/gpt-5.6-luna', outcome: 'answered' },
      }),
    ]);
    expect(turnCounts('ai-chat/turn-failed')).toEqual([]);
    expect(turnCounts('ai-chat/turn-started')).toHaveLength(1);
  });
});
