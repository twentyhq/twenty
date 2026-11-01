import { Logger } from '@nestjs/common';

import { AGENT_RUN_STOPPED_ERROR } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-stopped-error.constant';
import { AGENT_RUN_RESULT_LOST_ERROR } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-result-lost-error.constant';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { type RunAgentJobData } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/run-agent-job-data.type';
import { AGENT_TURN_INTERRUPTED_ERROR } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-turn-interrupted-error.constant';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

const JOB_DATA = {
  workspaceId: 'workspace-id',
  conversation: { threadId: 'thread-id', isCreated: true },
  caller: { type: 'AGENT_API_RUN', ref: { runId: 'run-id' } },
  spec: { agentId: 'agent-id', title: 'Follow up' },
  prompt: {
    messages: [{ role: 'user', content: 'Follow up tomorrow' }],
    senderUserWorkspaceId: null,
    senderApplicationId: 'application-id',
    turnId: 'run-id',
  },
} as unknown as RunAgentJobData;

const buildRunner = (
  recordedTurn: { status: AgentTurnStatus; error: unknown } | null,
  { responseFormat = null }: { responseFormat?: object | null } = {},
) => {
  const handler = {
    getWaitingState: jest.fn().mockResolvedValue('WAITING'),
    buildExecutionContext: jest.fn().mockResolvedValue({ authContext: {} }),
  };
  const agentRunConversationService = {
    claimThread: jest.fn().mockResolvedValue(true),
    openTurn: jest.fn().mockRejectedValue(new Error('Model unavailable')),
  };
  const agentRunSuspensionService = {
    deliverOutcome: jest.fn().mockResolvedValue(undefined),
  };
  const turnRecorderService = {
    findTurn: jest
      .fn()
      .mockResolvedValue(
        recordedTurn === null ? null : { id: 'run-id', ...recordedTurn },
      ),
    finish: jest.fn().mockResolvedValue(true),
  };

  const conversationReaderService = {
    findReplyText: jest.fn().mockResolvedValue('Followed up'),
  };

  const runner = new AgentRunnerService(
    {} as never,
    agentRunConversationService as never,
    conversationReaderService as never,
    {} as never,
    agentRunSuspensionService as never,
    { getHandlerOrThrow: () => handler } as never,
    {} as never,
    {
      runClaimed: ({
        work,
      }: {
        work: (abortSignal: AbortSignal) => Promise<unknown>;
      }) => work(new AbortController().signal),
    } as never,
    {} as never,
    {} as never,
    { shouldRunLegacyParkedCopy: jest.fn().mockResolvedValue(true) } as never,
    {} as never,
    {} as never,
    {
      resolveOrThrow: jest
        .fn()
        .mockResolvedValue({ agentId: 'agent-id', responseFormat }),
    } as never,
    turnRecorderService as never,
  );

  return {
    runner,
    agentRunConversationService,
    agentRunSuspensionService,
    turnRecorderService,
  };
};

const expectFailureDeliveredOnce = ({
  deliverOutcome,
  error,
}: {
  deliverOutcome: jest.Mock;
  error: string;
}) => {
  expect(deliverOutcome).toHaveBeenCalledTimes(1);
  expect(deliverOutcome).toHaveBeenCalledWith({
    workspaceId: 'workspace-id',
    caller: JOB_DATA.caller,
    threadId: 'thread-id',
    outcome: { status: 'FAILED', error },
    summary: null,
  });
};

describe('AgentRunnerService runStarted on a stalled job retried with its run id', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('ends a turn its dead worker left running as interrupted, without running the agent again', async () => {
    const {
      runner,
      agentRunConversationService,
      agentRunSuspensionService,
      turnRecorderService,
    } = buildRunner({ status: AgentTurnStatus.RUNNING, error: null });

    await runner.runStarted(JOB_DATA);

    expect(agentRunConversationService.openTurn).not.toHaveBeenCalled();
    expect(turnRecorderService.finish).toHaveBeenCalledTimes(1);
    expect(turnRecorderService.finish).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      turnId: 'run-id',
      status: AgentTurnStatus.FAILED,
      error: AGENT_TURN_INTERRUPTED_ERROR,
    });
    expectFailureDeliveredOnce({
      deliverOutcome: agentRunSuspensionService.deliverOutcome,
      error: AGENT_TURN_INTERRUPTED_ERROR.message,
    });
  });

  it('fails a run whose interrupted turn was already reaped with the error it was recorded with', async () => {
    const {
      runner,
      agentRunConversationService,
      agentRunSuspensionService,
      turnRecorderService,
    } = buildRunner({
      status: AgentTurnStatus.FAILED,
      error: AGENT_TURN_INTERRUPTED_ERROR,
    });

    await runner.runStarted(JOB_DATA);

    expect(agentRunConversationService.openTurn).not.toHaveBeenCalled();
    expect(turnRecorderService.finish).not.toHaveBeenCalled();
    expectFailureDeliveredOnce({
      deliverOutcome: agentRunSuspensionService.deliverOutcome,
      error: AGENT_TURN_INTERRUPTED_ERROR.message,
    });
  });

  it('fails a run whose turn a member stopped', async () => {
    const { runner, agentRunSuspensionService } = buildRunner({
      status: AgentTurnStatus.CANCELLED,
      error: null,
    });

    await runner.runStarted(JOB_DATA);

    expectFailureDeliveredOnce({
      deliverOutcome: agentRunSuspensionService.deliverOutcome,
      error: AGENT_RUN_STOPPED_ERROR,
    });
  });

  it('completes a run whose turn completed with the text of its reply', async () => {
    const {
      runner,
      agentRunConversationService,
      agentRunSuspensionService,
      turnRecorderService,
    } = buildRunner({ status: AgentTurnStatus.COMPLETED, error: null });

    await runner.runStarted(JOB_DATA);

    expect(agentRunConversationService.openTurn).not.toHaveBeenCalled();
    expect(turnRecorderService.finish).not.toHaveBeenCalled();
    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledTimes(1);
    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      caller: JOB_DATA.caller,
      threadId: 'thread-id',
      outcome: { status: 'COMPLETED', result: { response: 'Followed up' } },
      summary: null,
    });
  });

  it('fails a run whose completed turn had a structured result, which is kept nowhere', async () => {
    const { runner, agentRunSuspensionService } = buildRunner(
      { status: AgentTurnStatus.COMPLETED, error: null },
      { responseFormat: { type: 'json', schema: {} } },
    );

    await runner.runStarted(JOB_DATA);

    expectFailureDeliveredOnce({
      deliverOutcome: agentRunSuspensionService.deliverOutcome,
      error: AGENT_RUN_RESULT_LOST_ERROR,
    });
  });

  it('leaves a run whose turn waits to its wake-up', async () => {
    const {
      runner,
      agentRunConversationService,
      agentRunSuspensionService,
      turnRecorderService,
    } = buildRunner({ status: AgentTurnStatus.WAITING_FOR_INPUT, error: null });

    await runner.runStarted(JOB_DATA);

    expect(agentRunConversationService.openTurn).not.toHaveBeenCalled();
    expect(turnRecorderService.finish).not.toHaveBeenCalled();
    expect(agentRunSuspensionService.deliverOutcome).not.toHaveBeenCalled();
  });

  it('opens the turn of a run that has not started yet with its run id', async () => {
    const { runner, agentRunConversationService } = buildRunner(null);

    await runner.runStarted(JOB_DATA);

    expect(agentRunConversationService.openTurn).toHaveBeenCalledTimes(1);
    expect(agentRunConversationService.openTurn).toHaveBeenCalledWith(
      expect.objectContaining({ threadId: 'thread-id', turnId: 'run-id' }),
    );
  });
});
