import { isDefined } from 'twenty-shared/utils';

import { AGENT_RUN_OUT_OF_CREDITS_ERROR } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-out-of-credits-error.const';
import { AgentRunWithoutConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-without-conversation.service';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

const WORKSPACE_ID = 'workspace-id';
const TURN_ID = 'turn-id';

const caller = {
  type: 'WORKFLOW_STEP',
  ref: { workflowRunId: 'run', stepId: 'step' },
};

const inlineSpec = {
  agentId: null,
  inlineConfig: {
    instructions: 'Qualify the lead.',
    modelId: 'model-id',
    modelConfiguration: null,
    scope: null,
    applicationId: null,
    promptCacheKey: 'workflow-step:step',
  },
  title: 'Qualify',
  baseSystemPrompt: 'You run in a workflow.',
  instructions: null,
  capabilities: { canAskHumans: false },
};

const buildStarted = (streamError?: unknown) => ({
  source: {
    parts: new ReadableStream({
      start(controller) {
        controller.enqueue({ type: 'text-delta', text: 'Qualified' });
        controller.enqueue({
          type: 'finish-step',
          usage: { inputTokens: 1_000, outputTokens: 100 },
        });
        controller.close();
      },
    }),
    modelConfig: {
      modelId: 'model-id',
      inputCostPerMillionTokens: 3,
      outputCostPerMillionTokens: 15,
    },
    getStreamError: () => streamError,
  },
});

const buildService = ({
  waitingState = 'WAITING',
  streamError,
  stopReason,
  personaError,
  finishError,
  completeError,
}: {
  waitingState?: string;
  streamError?: unknown;
  stopReason?: string;
  personaError?: Error;
  finishError?: Error;
  completeError?: Error;
} = {}) => {
  const handler = {
    getWaitingState: jest.fn().mockResolvedValue(waitingState),
    buildExecutionContext: jest.fn().mockResolvedValue({
      authContext: { type: 'application' },
      turnCreatedBy: { source: 'WORKFLOW', name: 'Workflow' },
    }),
  };
  const agentRunTurnService = {
    startTurn: jest.fn().mockResolvedValue(buildStarted(streamError)),
    completeTurn: isDefined(completeError)
      ? jest.fn().mockRejectedValue(completeError)
      : jest.fn().mockResolvedValue({
          result: { response: 'Qualified' },
          steps: [],
          modelId: 'model-id',
          stopReason,
          usage: {},
          nativeWebSearchCallCount: 0,
          isPaused: false,
          totalCostInDollars: 0,
          creditsUsedMicro: 0,
          structuredOutputSteps: [],
        }),
  };
  const agentRunSuspensionService = {
    deliverOutcome: jest.fn().mockResolvedValue(undefined),
  };
  const conversationWriterService = {
    insertTurn: jest.fn().mockResolvedValue(TURN_ID),
  };
  const turnRecorderService = {
    finish: isDefined(finishError)
      ? jest.fn().mockRejectedValue(finishError)
      : jest.fn().mockResolvedValue(true),
    recordUsage: jest.fn().mockResolvedValue(undefined),
  };

  const service = new AgentRunWithoutConversationService(
    { getHandlerOrThrow: () => handler } as never,
    {
      resolveOrThrow: isDefined(personaError)
        ? jest.fn().mockRejectedValue(personaError)
        : jest.fn().mockResolvedValue({
            agentId: null,
            applicationId: null,
            instructions: 'Qualify the lead.',
            modelId: 'model-id',
            modelConfiguration: null,
            responseFormat: null,
            promptCacheKey: 'workflow-step:step',
            permissions: { type: 'scope', scope: null },
          }),
    } as never,
    agentRunTurnService as never,
    agentRunSuspensionService as never,
    conversationWriterService as never,
    turnRecorderService as never,
  );

  return {
    service,
    agentRunTurnService,
    agentRunSuspensionService,
    conversationWriterService,
    turnRecorderService,
  };
};

const run = (service: AgentRunWithoutConversationService) =>
  service.run({
    workspaceId: WORKSPACE_ID,
    caller,
    spec: inlineSpec,
    prompt: {
      messages: [{ role: 'user', content: 'Qualify Acme' }],
      senderUserWorkspaceId: null,
      senderApplicationId: null,
    },
  } as never);

describe('AgentRunWithoutConversationService', () => {
  it('records a turn without a thread and hands the result to the caller', async () => {
    const {
      service,
      agentRunTurnService,
      agentRunSuspensionService,
      conversationWriterService,
      turnRecorderService,
    } = buildService();

    await run(service);

    expect(conversationWriterService.insertTurn).toHaveBeenCalledTimes(1);
    expect(conversationWriterService.insertTurn).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: null,
        agentId: null,
        status: AgentTurnStatus.RUNNING,
      }),
    );
    expect(agentRunTurnService.startTurn).toHaveBeenCalledWith(
      expect.not.objectContaining({ pausingTools: expect.anything() }),
    );
    expect(turnRecorderService.recordUsage).toHaveBeenCalledTimes(1);
    expect(turnRecorderService.recordUsage).toHaveBeenCalledWith(
      expect.objectContaining({
        turnId: TURN_ID,
        threadId: null,
        usage: expect.objectContaining({
          inputTokens: 1_000,
          outputTokens: 100,
        }),
      }),
    );
    expect(turnRecorderService.finish).toHaveBeenCalledTimes(1);
    expect(turnRecorderService.finish).toHaveBeenCalledWith(
      expect.objectContaining({
        turnId: TURN_ID,
        status: AgentTurnStatus.COMPLETED,
      }),
    );
    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledTimes(1);
    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: null,
        outcome: { status: 'COMPLETED', result: { response: 'Qualified' } },
      }),
    );
  });

  it('fails the turn and the outcome when the stream errors, keeping the usage spent', async () => {
    const { service, agentRunSuspensionService, turnRecorderService } =
      buildService({ streamError: new Error('provider down') });

    await run(service);

    expect(turnRecorderService.finish).toHaveBeenCalledTimes(1);
    expect(turnRecorderService.finish).toHaveBeenCalledWith(
      expect.objectContaining({ status: AgentTurnStatus.FAILED }),
    );
    expect(turnRecorderService.recordUsage).toHaveBeenCalledTimes(1);
    expect(turnRecorderService.recordUsage).toHaveBeenCalledWith(
      expect.objectContaining({
        usage: expect.objectContaining({ inputTokens: 1_000 }),
      }),
    );
    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledTimes(1);
    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: { status: 'FAILED', error: 'provider down' },
      }),
    );
  });

  it('fails a run stopped for lack of credits', async () => {
    const { service, agentRunSuspensionService } = buildService({
      stopReason: 'NO_CREDITS',
    });

    await run(service);

    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: {
          status: 'FAILED',
          error: AGENT_RUN_OUT_OF_CREDITS_ERROR,
        },
      }),
    );
  });

  it('runs nothing for a caller that stopped waiting', async () => {
    const { service, agentRunTurnService, conversationWriterService } =
      buildService({ waitingState: 'GONE' });

    await run(service);

    expect(conversationWriterService.insertTurn).not.toHaveBeenCalled();
    expect(agentRunTurnService.startTurn).not.toHaveBeenCalled();
  });

  it('fails the outcome when the run cannot start, so the step never stays pending', async () => {
    const {
      service,
      agentRunSuspensionService,
      conversationWriterService,
      turnRecorderService,
    } = buildService({ personaError: new Error('Agent is archived') });

    await run(service);

    expect(conversationWriterService.insertTurn).not.toHaveBeenCalled();
    expect(turnRecorderService.finish).not.toHaveBeenCalled();
    expect(turnRecorderService.recordUsage).not.toHaveBeenCalled();
    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledTimes(1);
    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: { status: 'FAILED', error: 'Agent is archived' },
      }),
    );
  });

  it('leaves a workflow step on the follow-up structured output request', async () => {
    const { service, agentRunTurnService } = buildService();

    await run(service);

    expect(
      agentRunTurnService.startTurn.mock.calls[0][0].structuredOutputStrategy,
    ).toBeUndefined();
    expect(
      agentRunTurnService.completeTurn.mock.calls[0][0]
        .structuredOutputStrategy,
    ).toBeUndefined();
  });

  it('hands the structured output strategy of a one-shot run to its turn', async () => {
    const { service, agentRunTurnService } = buildService();

    await service.runOneShot({
      workspaceId: WORKSPACE_ID,
      buildExecutionContext: jest.fn().mockResolvedValue({
        authContext: { type: 'application' },
        turnCreatedBy: { source: 'APPLICATION', name: 'App' },
      }),
      spec: inlineSpec,
      messages: [{ role: 'user', content: 'Qualify Acme' }],
      structuredOutputStrategy: 'same-request',
    });

    expect(agentRunTurnService.startTurn).toHaveBeenCalledTimes(1);
    expect(agentRunTurnService.startTurn).toHaveBeenCalledWith(
      expect.objectContaining({ structuredOutputStrategy: 'same-request' }),
    );
    expect(agentRunTurnService.completeTurn).toHaveBeenCalledWith(
      expect.objectContaining({ structuredOutputStrategy: 'same-request' }),
    );
  });

  it('fails the outcome, without throwing, when the reply matches no object', async () => {
    const { service, turnRecorderService } = buildService({
      completeError: new Error(
        'The model did not return an object matching the response format',
      ),
    });

    const oneShotRun = await service.runOneShot({
      workspaceId: WORKSPACE_ID,
      buildExecutionContext: jest.fn().mockResolvedValue({
        authContext: { type: 'application' },
        turnCreatedBy: { source: 'APPLICATION', name: 'App' },
      }),
      spec: inlineSpec,
      messages: [{ role: 'user', content: 'Qualify Acme' }],
      structuredOutputStrategy: 'same-request',
    });

    expect(oneShotRun.outcome).toEqual({
      status: 'FAILED',
      error: 'The model did not return an object matching the response format',
    });
    expect(turnRecorderService.recordUsage).toHaveBeenCalledWith(
      expect.objectContaining({
        usage: expect.objectContaining({ inputTokens: 1_000 }),
      }),
    );
  });

  it('keeps a completed outcome when recording the turn fails', async () => {
    const { service, agentRunSuspensionService } = buildService({
      finishError: new Error('connection reset'),
    });

    await run(service);

    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledTimes(1);
    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: { status: 'COMPLETED', result: { response: 'Qualified' } },
      }),
    );
  });
});
