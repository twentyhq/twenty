import { Logger } from '@nestjs/common';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentRunnerRunInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-run-input.type';
import { type AgentTurnStreamResult } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-turn-stream.service';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { type AgentResponseFormat } from 'src/engine/metadata-modules/ai/ai-agent/types/agent-response-format.type';

const CREATED_BY = {
  source: 'WORKFLOW',
  name: 'New deals',
  workspaceMemberId: null,
  context: {},
} as AgentRunnerRunInput['executionContext']['turnCreatedBy'];

const PRIOR_MESSAGES = [{ id: 'message-id', role: 'assistant', parts: [] }];

const MESSAGES = [{ role: 'user' as const, content: 'Draft a quote' }];

const AGENT = { id: 'agent-id' } as AgentEntity;

const buildExecution = (
  overrides: Partial<AgentExecutionResult> = {},
): AgentExecutionResult => ({
  result: { answer: 'done' },
  usage: {
    inputTokens: 1,
    outputTokens: 2,
    totalTokens: 3,
  } as AgentExecutionResult['usage'],
  cacheCreationTokens: 0,
  nativeWebSearchCallCount: 0,
  hasNoMoreAvailableCredits: false,
  isPaused: false,
  steps: [],
  modelId: 'model-id',
  totalCostInDollars: 0,
  creditsUsedMicro: 0,
  ...overrides,
});

const buildStreamed = (
  overrides: Partial<AgentTurnStreamResult> = {},
): AgentTurnStreamResult => ({
  assistantMessageId: 'assistant-message-id',
  replyParts: [],
  isAborted: false,
  streamError: undefined,
  usage: {
    inputTokens: 1,
    outputTokens: 2,
    inputCredits: 0,
    outputCredits: 0,
    cacheReadTokens: 0,
    cacheCreationTokens: 0,
    conversationSize: 1,
  },
  modelConfig: null,
  ...overrides,
});

const buildAgent = (responseFormat: AgentResponseFormat): AgentEntity =>
  Object.assign(new AgentEntity(), { id: 'agent-id', responseFormat });

const RUN_INPUT: AgentRunnerRunInput = {
  workspaceId: 'workspace-id',
  conversation: { threadId: 'thread-id', isCreated: false },
  caller: {
    type: 'WORKFLOW_STEP',
    ref: { workflowRunId: 'run', stepId: 'step' },
  },
  spec: {
    agentId: 'agent-id',
    title: 'Draft the quote',
    baseSystemPrompt: 'base prompt',
    instructions: null,
    capabilities: {
      canAskHumans: false,
    },
  },
  agent: AGENT,
  prompt: {
    messages: MESSAGES,
    senderUserWorkspaceId: 'user-workspace-id',
    senderApplicationId: null,
  },
  executionContext: {
    authContext: {} as never,
    userWorkspaceId: 'user-workspace-id',
    rolePermissionConfig: { intersectionOf: {} },
    conversationActor: { type: 'application', applicationId: 'app-id' },
    turnCreatedBy: CREATED_BY,
    usageOperationType: UsageOperationType.AI_WORKFLOW_TOKEN,
  },
};

const {
  agent: _agent,
  executionContext: _executionContext,
  ...JOB_DATA
} = RUN_INPUT;

const SUSPENSION = {
  caller: RUN_INPUT.caller,
  runSpec: RUN_INPUT.spec,
  summary: null,
  continuationCount: 0,
};

const CONTINUATION = {
  workspaceId: 'workspace-id',
  threadId: 'thread-id',
  wakeUpId: 'wake-up-id',
  outcome: { type: 'ANSWERED' as const, answer: { result: {} } },
};

const buildService = ({
  execution = buildExecution(),
  streamed = buildStreamed(),
  agent = AGENT,
}: {
  execution?: AgentExecutionResult;
  streamed?: AgentTurnStreamResult;
  agent?: AgentEntity;
} = {}) => {
  const agentRunTurnService = {
    startTurn: jest.fn().mockResolvedValue({ source: {} }),
    completeTurn: jest.fn().mockResolvedValue(execution),
  };
  const agentRunConversationService = {
    claimThread: jest.fn().mockResolvedValue(true),
    openTurn: jest.fn().mockResolvedValue('turn-id'),
  };
  const turnStreamService = {
    runClaimed: jest.fn(({ work }) => work(new AbortController().signal)),
    stream: jest.fn(async ({ startTurn }) => {
      await startTurn({});

      return streamed;
    }),
    finishTurn: jest.fn().mockResolvedValue({ isAwaitingAnswer: false }),
    publishTurnEnd: jest.fn().mockResolvedValue(undefined),
  };
  const conversationReaderService = {
    loadMessages: jest.fn().mockResolvedValue(PRIOR_MESSAGES),
  };

  const agentRunSuspensionService = {
    assertConversationNotSuspended: jest.fn().mockResolvedValue(undefined),
    closeAwaitedCalls: jest.fn().mockResolvedValue(undefined),
    suspend: jest.fn().mockResolvedValue(undefined),
    settle: jest.fn().mockResolvedValue(undefined),
    recordWaitOutcome: jest.fn().mockResolvedValue(undefined),
    deliverOutcome: jest.fn().mockResolvedValue(undefined),
  };
  const callerHandler = {
    getWaitingState: jest.fn().mockResolvedValue('WAITING'),
    buildExecutionContext: jest
      .fn()
      .mockResolvedValue(RUN_INPUT.executionContext),
    onSuspended: jest.fn().mockResolvedValue(undefined),
  };
  const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };
  const chatMessageQueueService = {
    add: jest.fn().mockResolvedValue(undefined),
  };

  const pendingWakeUpService = {
    find: jest.fn().mockResolvedValue({
      condition: { type: 'ANSWER', threadId: 'thread-id' },
      payload: SUSPENSION,
    }),
    claim: jest.fn().mockResolvedValue(null),
    cancel: jest.fn().mockResolvedValue([]),
  };

  jest.spyOn(Logger.prototype, 'error').mockImplementation();

  const service = new AgentRunnerService(
    agentRunTurnService as never,
    agentRunConversationService as never,
    conversationReaderService as never,
    agentRunSuspensionService as never,
    { getHandlerOrThrow: () => callerHandler } as never,
    pendingWakeUpService as never,
    turnStreamService as never,
    messageQueueService as never,
    chatMessageQueueService as never,
    { findOne: jest.fn().mockResolvedValue(agent) } as never,
  );

  return {
    service,
    messageQueueService,
    chatMessageQueueService,
    agentRunTurnService,
    agentRunConversationService,
    turnStreamService,
    conversationReaderService,
    agentRunSuspensionService,
    callerHandler,
    pendingWakeUpService,
  };
};

describe('AgentRunnerService', () => {
  it('starts a run in a job, without the agent or how it acts', async () => {
    const { service, messageQueueService, agentRunTurnService } =
      buildService();

    await service.start(JOB_DATA);

    expect(messageQueueService.add).toHaveBeenCalledWith(
      'RunAgentJob',
      JOB_DATA,
    );
    expect(agentRunTurnService.startTurn).not.toHaveBeenCalled();
  });

  it('runs a started run as its caller acts now and hands the caller its outcome', async () => {
    const { service, callerHandler, agentRunSuspensionService } =
      buildService();

    await service.runStarted(JOB_DATA);

    expect(callerHandler.buildExecutionContext).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      caller: RUN_INPUT.caller,
    });
    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      caller: RUN_INPUT.caller,
      threadId: 'thread-id',
      outcome: { status: 'COMPLETED', result: { answer: 'done' } },
      summary: expect.objectContaining({ modelId: 'model-id' }),
    });
  });

  it('streams the run in its conversation, holding it, and records the turn', async () => {
    const {
      service,
      agentRunTurnService,
      agentRunConversationService,
      turnStreamService,
      conversationReaderService,
      chatMessageQueueService,
    } = buildService();

    await service.runStarted(JOB_DATA);

    expect(agentRunConversationService.claimThread).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      title: 'Draft the quote',
      streamId: expect.any(String),
    });
    expect(conversationReaderService.loadMessages).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      actor: { type: 'application', applicationId: 'app-id' },
    });
    expect(agentRunConversationService.openTurn).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      agentId: 'agent-id',
      senderUserWorkspaceId: 'user-workspace-id',
      senderApplicationId: null,
      createdBy: CREATED_BY,
      messages: MESSAGES,
    });
    expect(agentRunTurnService.startTurn).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: MESSAGES,
        baseSystemPrompt: expect.stringMatching(
          /^base prompt\n\n.*wait_for_event/,
        ),
        priorMessages: PRIOR_MESSAGES,
        executionContext: RUN_INPUT.executionContext,
      }),
    );
    expect(turnStreamService.finishTurn).toHaveBeenCalledWith(
      expect.objectContaining({
        turnId: 'turn-id',
        isWaiting: false,
        shouldRecordReplyActivity: false,
      }),
    );
    expect(turnStreamService.publishTurnEnd).toHaveBeenCalled();
    expect(chatMessageQueueService.add).toHaveBeenCalledWith(
      'FlushQueuedAgentChatMessagesJob',
      { workspaceId: 'workspace-id', threadId: 'thread-id' },
    );
  });

  it('waits for a reply streaming in its conversation by trying the run again later', async () => {
    const {
      service,
      agentRunConversationService,
      agentRunTurnService,
      messageQueueService,
      agentRunSuspensionService,
    } = buildService();

    agentRunConversationService.claimThread.mockResolvedValue(false);

    await service.runStarted(JOB_DATA);

    expect(agentRunTurnService.startTurn).not.toHaveBeenCalled();
    expect(messageQueueService.add).toHaveBeenCalledWith(
      'RunAgentJob',
      { ...JOB_DATA, busyAttempt: 1 },
      { delay: expect.any(Number) },
    );
    expect(agentRunSuspensionService.deliverOutcome).not.toHaveBeenCalled();
  });

  it('fails a run whose conversation stayed busy', async () => {
    const {
      service,
      agentRunConversationService,
      messageQueueService,
      agentRunSuspensionService,
    } = buildService();

    agentRunConversationService.claimThread.mockResolvedValue(false);

    await service.runStarted({ ...JOB_DATA, busyAttempt: 179 });

    expect(messageQueueService.add).not.toHaveBeenCalled();
    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: { status: 'FAILED', error: 'The conversation stayed busy' },
      }),
    );
  });

  it('hands the caller a failure when a started run cannot run', async () => {
    const { service, callerHandler, agentRunSuspensionService } =
      buildService();

    callerHandler.buildExecutionContext.mockRejectedValue(
      new Error('trigger turned off'),
    );

    await service.runStarted(JOB_DATA);

    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: { status: 'FAILED', error: 'trigger turned off' },
        summary: null,
      }),
    );
  });

  it('hands the caller a failure when the model stream fails', async () => {
    const { service, agentRunTurnService, agentRunSuspensionService } =
      buildService({
        streamed: buildStreamed({ streamError: new Error('provider down') }),
      });

    await service.runStarted(JOB_DATA);

    expect(agentRunTurnService.completeTurn).not.toHaveBeenCalled();
    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: { status: 'FAILED', error: 'provider down' },
      }),
    );
  });

  it('fails a run someone stopped, without waiting on what it asked', async () => {
    const { service, agentRunSuspensionService } = buildService({
      execution: buildExecution({ isPaused: true }),
      streamed: buildStreamed({ isAborted: true }),
    });

    await service.runStarted(JOB_DATA);

    expect(agentRunSuspensionService.suspend).not.toHaveBeenCalled();
    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: { status: 'FAILED', error: 'The run was stopped' },
      }),
    );
  });

  it('does not run a started run whose caller stopped waiting while it was queued', async () => {
    const {
      service,
      callerHandler,
      agentRunTurnService,
      agentRunSuspensionService,
    } = buildService();

    callerHandler.getWaitingState.mockResolvedValue('GONE');

    await service.runStarted(JOB_DATA);

    expect(callerHandler.buildExecutionContext).not.toHaveBeenCalled();
    expect(agentRunTurnService.startTurn).not.toHaveBeenCalled();
    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: expect.objectContaining({ status: 'FAILED' }),
      }),
    );
  });

  it('suspends a run that asked a question on an answer to it, and shows its caller where it waits', async () => {
    const {
      service,
      turnStreamService,
      agentRunSuspensionService,
      callerHandler,
    } = buildService({ execution: buildExecution({ isPaused: true }) });

    turnStreamService.finishTurn.mockResolvedValue({ isAwaitingAnswer: true });

    await service.runStarted(JOB_DATA);

    expect(agentRunSuspensionService.suspend).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      condition: { type: 'ANSWER', threadId: 'thread-id' },
      suspension: expect.objectContaining({
        caller: RUN_INPUT.caller,
        runSpec: RUN_INPUT.spec,
        continuationCount: 0,
      }),
    });
    expect(callerHandler.onSuspended).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      caller: RUN_INPUT.caller,
      threadId: 'thread-id',
      summary: expect.objectContaining({ modelId: 'model-id' }),
    });
    expect(agentRunSuspensionService.closeAwaitedCalls).not.toHaveBeenCalled();
    expect(agentRunSuspensionService.deliverOutcome).not.toHaveBeenCalled();
  });

  it("asks for the caller's output format over the agent's own", async () => {
    const { service, agentRunTurnService } = buildService({
      agent: buildAgent({ type: 'text' }),
    });
    const callerResponseFormat = {
      type: 'json' as const,
      schema: {
        type: 'object' as const,
        properties: { summary: { type: 'string' as const } },
      },
    };

    await service.runStarted({
      ...JOB_DATA,
      spec: { ...JOB_DATA.spec, responseFormat: callerResponseFormat },
    });

    expect(agentRunTurnService.startTurn).toHaveBeenCalledWith(
      expect.objectContaining({ responseFormat: callerResponseFormat }),
    );
  });

  it("falls back to the agent's output format when the caller gives none", async () => {
    const agentResponseFormat = {
      type: 'json' as const,
      schema: {
        type: 'object' as const,
        properties: { summary: { type: 'string' as const } },
      },
    };
    const { service, agentRunTurnService } = buildService({
      agent: buildAgent(agentResponseFormat),
    });

    await service.runStarted(JOB_DATA);

    expect(agentRunTurnService.startTurn).toHaveBeenCalledWith(
      expect.objectContaining({ responseFormat: agentResponseFormat }),
    );
  });

  it.each([true, false])(
    'offers every human-input tool only to a run that can ask humans (%s)',
    async (canAskHumans) => {
      const { service, agentRunTurnService } = buildService();

      await service.runStarted({
        ...JOB_DATA,
        spec: { ...JOB_DATA.spec, capabilities: { canAskHumans } },
      });

      expect(agentRunTurnService.startTurn).toHaveBeenCalledWith(
        expect.objectContaining({ canAskHumans }),
      );
    },
  );

  it('runs in a conversation it just created without reading it', async () => {
    const { service, conversationReaderService, agentRunTurnService } =
      buildService();

    await service.runStarted({
      ...JOB_DATA,
      conversation: { threadId: 'thread-id', isCreated: true },
    });

    expect(conversationReaderService.loadMessages).not.toHaveBeenCalled();
    expect(agentRunTurnService.startTurn).toHaveBeenCalledWith(
      expect.objectContaining({ priorMessages: [] }),
    );
  });

  it('fails a run that ran out of credits', async () => {
    const { service, agentRunSuspensionService } = buildService({
      execution: buildExecution({ hasNoMoreAvailableCredits: true }),
    });

    await service.runStarted(JOB_DATA);

    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: {
          status: 'FAILED',
          error: 'Agent stopped: no more available credits.',
        },
      }),
    );
  });

  it('stops a continued run that keeps pausing and closes what it asked', async () => {
    const {
      service,
      turnStreamService,
      agentRunConversationService,
      agentRunSuspensionService,
      conversationReaderService,
      pendingWakeUpService,
    } = buildService({ execution: buildExecution({ isPaused: true }) });

    turnStreamService.finishTurn.mockResolvedValue({ isAwaitingAnswer: true });
    pendingWakeUpService.find.mockResolvedValue({
      condition: { type: 'ANSWER', threadId: 'thread-id' },
      payload: { ...SUSPENSION, continuationCount: 49 },
    });

    await service.continue(CONTINUATION);

    expect(agentRunConversationService.claimThread).toHaveBeenCalledTimes(1);
    expect(pendingWakeUpService.claim).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      wakeUpId: 'wake-up-id',
    });
    expect(conversationReaderService.loadMessages).toHaveBeenCalled();
    expect(agentRunSuspensionService.suspend).not.toHaveBeenCalled();
    expect(agentRunSuspensionService.closeAwaitedCalls).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      isAwaitingAnswer: true,
    });
    expect(agentRunSuspensionService.settle).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: 'thread-id',
        outcome: {
          status: 'FAILED',
          error: 'Agent stopped: it paused more than 50 times in one run.',
        },
      }),
    );
  });

  it('continues a run later when a reply streams in its conversation', async () => {
    const {
      service,
      agentRunConversationService,
      agentRunTurnService,
      messageQueueService,
      pendingWakeUpService,
    } = buildService();

    agentRunConversationService.claimThread.mockResolvedValue(false);

    await service.continue(CONTINUATION);

    expect(agentRunTurnService.startTurn).not.toHaveBeenCalled();
    expect(pendingWakeUpService.claim).not.toHaveBeenCalled();
    expect(messageQueueService.add).toHaveBeenCalledWith(
      'ContinueAgentRunJob',
      { ...CONTINUATION, busyAttempt: 1 },
      { delay: expect.any(Number) },
    );
  });

  it('drops a continuation whose caller stopped waiting', async () => {
    const { service, callerHandler, agentRunTurnService } = buildService();

    callerHandler.getWaitingState.mockResolvedValue('GONE');

    await service.continue(CONTINUATION);

    expect(agentRunTurnService.startTurn).not.toHaveBeenCalled();
  });

  it('continues a pause once, as a second continuation finds its wake-up removed', async () => {
    const { service, pendingWakeUpService, agentRunTurnService } =
      buildService();

    pendingWakeUpService.find.mockResolvedValue(null);

    await service.continue(CONTINUATION);

    expect(agentRunTurnService.startTurn).not.toHaveBeenCalled();
  });

  it('continues a run again when the worker running it died, as its wake-up is still there', async () => {
    const {
      service,
      pendingWakeUpService,
      agentRunTurnService,
      agentRunSuspensionService,
    } = buildService();

    agentRunTurnService.startTurn.mockReturnValueOnce(new Promise(() => {}));

    void service.continue(CONTINUATION);

    while (agentRunTurnService.startTurn.mock.calls.length === 0) {
      await Promise.resolve();
    }

    expect(pendingWakeUpService.claim).not.toHaveBeenCalled();

    await service.continue(CONTINUATION);

    expect(agentRunTurnService.startTurn).toHaveBeenCalledTimes(2);
    expect(agentRunSuspensionService.settle).toHaveBeenCalledTimes(1);
    expect(pendingWakeUpService.claim).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      wakeUpId: 'wake-up-id',
    });
  });

  it('keeps the wake-up of a run whose caller could not be handed the outcome', async () => {
    const { service, pendingWakeUpService, agentRunSuspensionService } =
      buildService();

    agentRunSuspensionService.settle.mockRejectedValue(new Error('db down'));

    await expect(service.continue(CONTINUATION)).rejects.toThrow('db down');

    expect(pendingWakeUpService.claim).not.toHaveBeenCalled();
  });

  it('fails the run when its answer could not be delivered', async () => {
    const { service, agentRunSuspensionService, agentRunTurnService } =
      buildService();

    await service.continue({
      ...CONTINUATION,
      outcome: { type: 'ANSWERED', answer: { error: 'answer lost' } },
    });

    expect(agentRunTurnService.startTurn).not.toHaveBeenCalled();
    expect(agentRunSuspensionService.settle).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: { status: 'FAILED', error: 'answer lost' },
        isAwaitingAnswer: true,
      }),
    );
  });

  it('fails a claimed run whose caller cannot be read, rather than dropping it', async () => {
    const { service, callerHandler, agentRunSuspensionService } =
      buildService();

    callerHandler.getWaitingState.mockRejectedValue(new Error('db down'));

    await service.continue(CONTINUATION);

    expect(agentRunSuspensionService.settle).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: { status: 'FAILED', error: 'db down' },
      }),
    );
  });

  it('drops the pause of a continued run whose caller stopped waiting while it ran', async () => {
    const {
      service,
      callerHandler,
      turnStreamService,
      agentRunSuspensionService,
      pendingWakeUpService,
    } = buildService({ execution: buildExecution({ isPaused: true }) });

    turnStreamService.finishTurn.mockResolvedValue({ isAwaitingAnswer: true });
    callerHandler.getWaitingState
      .mockResolvedValueOnce('WAITING')
      .mockResolvedValueOnce('GONE');

    await service.continue(CONTINUATION);

    expect(agentRunSuspensionService.suspend).toHaveBeenCalled();
    expect(pendingWakeUpService.cancel).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      owner: { type: 'AGENT_RUN', id: 'thread-id' },
    });
    expect(agentRunSuspensionService.closeAwaitedCalls).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      isAwaitingAnswer: true,
    });
  });
});
