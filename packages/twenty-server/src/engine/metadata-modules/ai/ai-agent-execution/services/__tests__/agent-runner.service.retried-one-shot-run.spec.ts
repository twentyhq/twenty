import { Logger } from '@nestjs/common';

import { AGENT_RUN_RESULT_LOST_ERROR } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-result-lost-error.constant';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { type RunAgentJobData } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/run-agent-job-data.type';
import { AGENT_TURN_INTERRUPTED_ERROR } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-turn-interrupted-error.constant';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

const CALLER = {
  type: 'WORKFLOW_STEP',
  ref: { workflowRunId: 'workflow-run-id', stepId: 'step-id' },
};

const JOB_DATA = {
  workspaceId: 'workspace-id',
  conversation: null,
  turnId: 'turn-id',
  caller: CALLER,
  spec: { agentId: 'agent-id', title: 'Score the lead' },
  prompt: {
    messages: [{ role: 'user', content: 'Score this lead' }],
    senderUserWorkspaceId: null,
    senderApplicationId: null,
  },
} as unknown as RunAgentJobData;

const buildRunner = (
  recordedTurn: {
    status: AgentTurnStatus;
    error?: unknown;
    result?: object | null;
  } | null,
  { canStoreTurnResult = jest.fn().mockResolvedValue(true) } = {},
) => {
  const handler = {
    getWaitingState: jest.fn().mockResolvedValue('WAITING'),
    buildExecutionContext: jest.fn().mockResolvedValue({ authContext: {} }),
  };
  const agentRunTurnService = {
    startTurn: jest.fn(),
    completeTurn: jest.fn(),
  };
  const conversationWriterService = {
    insertTurn: jest.fn().mockRejectedValue(new Error('Database unavailable')),
    canStoreTurnResult,
  };
  const agentRunSuspensionService = {
    deliverOutcome: jest.fn().mockResolvedValue(undefined),
  };
  const turnStreamService = { streamTurn: jest.fn() };
  const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };
  const turnRecorderService = {
    findTurn: jest.fn().mockResolvedValue(
      recordedTurn === null
        ? null
        : {
            id: 'turn-id',
            error: null,
            result: null,
            ...recordedTurn,
          },
    ),
    finish: jest.fn().mockResolvedValue(true),
  };

  const runner = new AgentRunnerService(
    agentRunTurnService as never,
    {} as never,
    {} as never,
    conversationWriterService as never,
    agentRunSuspensionService as never,
    { getHandlerOrThrow: () => handler } as never,
    {} as never,
    turnStreamService as never,
    {} as never,
    {} as never,
    {} as never,
    { resolve: jest.fn().mockResolvedValue({}) } as never,
    messageQueueService as never,
    {
      resolveOrThrow: jest
        .fn()
        .mockResolvedValue({ agentId: 'agent-id', responseFormat: null }),
    } as never,
    turnRecorderService as never,
  );

  return {
    runner,
    agentRunTurnService,
    conversationWriterService,
    agentRunSuspensionService,
    turnStreamService,
    messageQueueService,
    turnRecorderService,
  };
};

const expectOutcomeDeliveredOnce = (
  deliverOutcome: jest.Mock,
  outcome: object,
) => {
  expect(deliverOutcome).toHaveBeenCalledTimes(1);
  expect(deliverOutcome).toHaveBeenCalledWith({
    workspaceId: 'workspace-id',
    caller: CALLER,
    threadId: null,
    outcome,
    summary: null,
  });
};

describe('AgentRunnerService runStarted on a retried one-shot run', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it.each([
    ['text', { response: 'The lead is warm' }],
    ['structured', { score: 82, isQualified: true }],
  ])(
    'hands back the stored %s result of a completed turn without calling the model',
    async (_kind, storedResult) => {
      const {
        runner,
        agentRunTurnService,
        conversationWriterService,
        agentRunSuspensionService,
        turnStreamService,
        turnRecorderService,
      } = buildRunner({
        status: AgentTurnStatus.COMPLETED,
        result: storedResult,
      });

      await runner.runStarted(JOB_DATA);

      expect(turnRecorderService.findTurn).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        turnId: 'turn-id',
      });
      expect(conversationWriterService.insertTurn).not.toHaveBeenCalled();
      expect(turnStreamService.streamTurn).not.toHaveBeenCalled();
      expect(agentRunTurnService.startTurn).not.toHaveBeenCalled();
      expect(agentRunTurnService.completeTurn).not.toHaveBeenCalled();
      expect(turnRecorderService.finish).not.toHaveBeenCalled();
      expectOutcomeDeliveredOnce(agentRunSuspensionService.deliverOutcome, {
        status: 'COMPLETED',
        result: storedResult,
      });
    },
  );

  it('fails a completed turn recorded before results were kept', async () => {
    const { runner, agentRunTurnService, agentRunSuspensionService } =
      buildRunner({ status: AgentTurnStatus.COMPLETED, result: null });

    await runner.runStarted(JOB_DATA);

    expect(agentRunTurnService.startTurn).not.toHaveBeenCalled();
    expectOutcomeDeliveredOnce(agentRunSuspensionService.deliverOutcome, {
      status: 'FAILED',
      error: AGENT_RUN_RESULT_LOST_ERROR,
    });
  });

  it('ends a turn its dead worker left running as interrupted, without running the agent again', async () => {
    const {
      runner,
      agentRunTurnService,
      agentRunSuspensionService,
      turnRecorderService,
    } = buildRunner({ status: AgentTurnStatus.RUNNING });

    await runner.runStarted(JOB_DATA);

    expect(agentRunTurnService.startTurn).not.toHaveBeenCalled();
    expect(turnRecorderService.finish).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      turnId: 'turn-id',
      status: AgentTurnStatus.FAILED,
      error: AGENT_TURN_INTERRUPTED_ERROR,
    });
    expectOutcomeDeliveredOnce(agentRunSuspensionService.deliverOutcome, {
      status: 'FAILED',
      error: AGENT_TURN_INTERRUPTED_ERROR.message,
    });
  });

  it('opens the turn of a run that has not started yet with the turn id of its job', async () => {
    const { runner, conversationWriterService } = buildRunner(null);

    await runner.runStarted(JOB_DATA);

    expect(conversationWriterService.insertTurn).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'turn-id', threadId: null }),
    );
  });
});

describe('AgentRunnerService runStarted on a one-shot run whose result fence cannot be read', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('fails the run before opening a turn it could leave running', async () => {
    const { runner, conversationWriterService, agentRunSuspensionService } =
      buildRunner(null, {
        canStoreTurnResult: jest
          .fn()
          .mockRejectedValue(new Error('Cache unavailable')),
      });

    await runner.runStarted(JOB_DATA);

    expect(conversationWriterService.insertTurn).not.toHaveBeenCalled();
    expectOutcomeDeliveredOnce(agentRunSuspensionService.deliverOutcome, {
      status: 'FAILED',
      error: 'Cache unavailable',
    });
  });
});

describe('AgentRunnerService start', () => {
  it('gives a one-shot run its turn id when it is queued', async () => {
    const { runner, messageQueueService } = buildRunner(null);

    await runner.start({ ...JOB_DATA, turnId: undefined });

    expect(messageQueueService.add).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ turnId: expect.any(String) }),
      {},
    );
  });

  it('leaves a run in a conversation to the turn its conversation opens', async () => {
    const { runner, messageQueueService } = buildRunner(null);

    await runner.start({
      ...JOB_DATA,
      turnId: undefined,
      conversation: { threadId: 'thread-id', isCreated: true },
    });

    expect(messageQueueService.add.mock.calls[0][1].turnId).toBeUndefined();
  });
});
