import { Logger } from '@nestjs/common';

import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentRunnerRunInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-run-input.type';

const CALLER = {
  type: 'WORKFLOW_STEP' as const,
  ref: { workflowRunId: 'run-id', stepId: 'step-id' },
};

const CREATED_BY = {
  source: 'WORKFLOW',
  name: 'New deals',
  workspaceMemberId: null,
  context: {},
} as Awaited<ReturnType<AgentRunnerRunInput['turn']['resolveCreatedBy']>>;

const PRIOR_MESSAGES = [{ id: 'message-id', role: 'assistant', parts: [] }];

const MESSAGES = [{ role: 'user' as const, content: 'Draft a quote' }];

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
  turnUsage: {
    inputTokens: 1,
    outputTokens: 2,
    cacheReadTokens: 0,
    cacheCreationTokens: 0,
    inputCredits: 0,
    outputCredits: 0,
  },
  ...overrides,
});

const RUN_INPUT: AgentRunnerRunInput = {
  workspaceId: 'workspace-id',
  conversation: { threadId: 'thread-id', isCreated: false },
  caller: CALLER,
  turn: {
    title: 'Draft the quote',
    senderUserWorkspaceId: 'user-workspace-id',
    senderApplicationId: null,
    messages: MESSAGES,
    resolveCreatedBy: async () => CREATED_BY,
  },
  execution: {
    agent: null,
    messages: MESSAGES,
    baseSystemPrompt: 'base prompt',
    workspaceId: 'workspace-id',
  },
};

const buildService = (execution = buildExecution()) => {
  const agentAsyncExecutorService = {
    executeAgent: jest.fn().mockResolvedValue(execution),
  };
  const agentRunConversationService = {
    openTurn: jest.fn().mockResolvedValue('turn-id'),
    closeTurn: jest.fn().mockResolvedValue({ isAwaitingAnswer: false }),
    failTurn: jest.fn().mockResolvedValue(undefined),
    withThreadLock: jest.fn(({ work }) => work()),
  };
  const conversationReaderService = {
    loadMessages: jest.fn().mockResolvedValue(PRIOR_MESSAGES),
  };

  jest.spyOn(Logger.prototype, 'error').mockImplementation();

  const service = new AgentRunnerService(
    agentAsyncExecutorService as never,
    agentRunConversationService as never,
    conversationReaderService as never,
  );

  return {
    service,
    agentAsyncExecutorService,
    agentRunConversationService,
    conversationReaderService,
  };
};

const pausedOnWait = buildExecution({
  isPaused: true,
  steps: [
    { content: [], toolResults: [{ toolName: 'search', output: {} }] },
    {
      content: [],
      toolResults: [
        {
          toolName: 'wait_for_event',
          output: { result: { status: 'pending' } },
        },
      ],
    },
  ] as unknown as AgentExecutionResult['steps'],
});

describe('AgentRunnerService', () => {
  it('continues a conversation under its lock and records the turn', async () => {
    const {
      service,
      agentAsyncExecutorService,
      agentRunConversationService,
      conversationReaderService,
    } = buildService();

    const { threadId, outcome, summary } = await service.run({
      ...RUN_INPUT,
      conversationActor: { type: 'application', applicationId: 'app-id' },
    });

    expect(threadId).toBe('thread-id');
    expect(outcome).toEqual({
      status: 'COMPLETED',
      result: { answer: 'done' },
    });
    expect(summary).toMatchObject({ modelId: 'model-id', toolCalls: [] });
    expect(agentRunConversationService.withThreadLock).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'workspace-id',
        threadId: 'thread-id',
      }),
    );
    expect(conversationReaderService.loadMessages).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      actor: { type: 'application', applicationId: 'app-id' },
    });
    expect(agentRunConversationService.openTurn).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      title: 'Draft the quote',
      agentId: null,
      senderUserWorkspaceId: 'user-workspace-id',
      senderApplicationId: null,
      createdBy: CREATED_BY,
      messages: MESSAGES,
    });
    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith({
      ...RUN_INPUT.execution,
      priorMessages: PRIOR_MESSAGES,
    });
    expect(agentRunConversationService.closeTurn).toHaveBeenCalledWith(
      expect.objectContaining({
        turnId: 'turn-id',
        title: 'Draft the quote',
        caller: CALLER,
      }),
    );
  });

  it('neither reads nor locks a conversation it just created', async () => {
    const {
      service,
      agentRunConversationService,
      conversationReaderService,
      agentAsyncExecutorService,
    } = buildService();

    await service.run({
      ...RUN_INPUT,
      conversation: { threadId: 'thread-id', isCreated: true },
    });

    expect(agentRunConversationService.withThreadLock).not.toHaveBeenCalled();
    expect(conversationReaderService.loadMessages).not.toHaveBeenCalled();
    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({ priorMessages: [] }),
    );
  });

  it.each([
    [
      'the turn author cannot be resolved',
      { resolveCreatedBy: jest.fn().mockRejectedValue(new Error('gone')) },
      {},
    ],
    [
      'the turn cannot be opened',
      {},
      { openTurn: jest.fn().mockRejectedValue(new Error('db down')) },
    ],
  ])(
    'still runs the agent when %s',
    async (_, turnOverrides, conversationOverrides) => {
      const {
        service,
        agentAsyncExecutorService,
        agentRunConversationService,
      } = buildService();

      Object.assign(agentRunConversationService, conversationOverrides);

      const { outcome } = await service.run({
        ...RUN_INPUT,
        turn: { ...RUN_INPUT.turn, ...turnOverrides },
      });

      expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalled();
      expect(agentRunConversationService.closeTurn).not.toHaveBeenCalled();
      expect(outcome).toEqual({
        status: 'COMPLETED',
        result: { answer: 'done' },
      });
    },
  );

  it('fails the turn of a run that throws', async () => {
    const { service, agentAsyncExecutorService, agentRunConversationService } =
      buildService();
    const error = new Error('provider down');

    agentAsyncExecutorService.executeAgent.mockRejectedValue(error);

    await expect(service.run(RUN_INPUT)).rejects.toThrow('provider down');
    expect(agentRunConversationService.failTurn).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      turnId: 'turn-id',
      error,
    });
    expect(agentRunConversationService.closeTurn).not.toHaveBeenCalled();
  });

  it('reports a run that ran out of credits', async () => {
    const { service } = buildService(
      buildExecution({ hasNoMoreAvailableCredits: true }),
    );

    await expect(service.run(RUN_INPUT)).resolves.toMatchObject({
      outcome: { status: 'NO_CREDITS' },
    });
  });

  it('reports a run awaiting an answer once its question is recorded', async () => {
    const { service, agentRunConversationService } = buildService(
      buildExecution({ isPaused: true }),
    );

    agentRunConversationService.closeTurn.mockResolvedValue({
      isAwaitingAnswer: true,
    });

    await expect(service.run(RUN_INPUT)).resolves.toMatchObject({
      outcome: { status: 'AWAITING_ANSWER' },
    });
  });

  it('hands back the calls of the last step a run paused on', async () => {
    const { service } = buildService(pausedOnWait);

    await expect(service.run(RUN_INPUT)).resolves.toMatchObject({
      outcome: {
        status: 'PAUSED',
        isResumable: true,
        pausedToolResults: [
          {
            toolName: 'wait_for_event',
            output: { result: { status: 'pending' } },
          },
        ],
      },
    });
  });

  it('cannot resume a pause it failed to record', async () => {
    const { service, agentRunConversationService } = buildService(pausedOnWait);

    agentRunConversationService.closeTurn.mockRejectedValue(
      new Error('db down'),
    );

    await expect(service.run(RUN_INPUT)).resolves.toMatchObject({
      outcome: { status: 'PAUSED', isResumable: false },
    });
  });
});
