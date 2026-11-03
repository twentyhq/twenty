import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { type RunAgentJobData } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/run-agent-job-data.type';
import { AGENT_TURN_INTERRUPTED_ERROR } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-turn-interrupted-error.constant';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

const JOB_DATA = {
  workspaceId: 'workspace-id',
  conversation: { threadId: 'thread-id', isCreated: true },
  caller: { type: 'AGENT_API_RUN', ref: { runId: 'run-id' } },
  spec: { agentId: 'agent-id', title: 'Follow up' },
  turnId: 'run-id',
  prompt: {
    messages: [{ role: 'user', content: 'Follow up tomorrow' }],
    senderUserWorkspaceId: null,
    senderApplicationId: 'application-id',
  },
} as unknown as RunAgentJobData;

const buildRunner = (recordedTurn: { status: AgentTurnStatus } | null) => {
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
        isDefined(recordedTurn) ? { id: 'run-id', ...recordedTurn } : null,
      ),
    finish: jest.fn().mockResolvedValue(true),
  };

  const runner = new AgentRunnerService(
    {} as never,
    agentRunConversationService as never,
    {} as never,
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
      resolveOrThrow: jest.fn().mockResolvedValue({ agentId: 'agent-id' }),
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
    } = buildRunner({ status: AgentTurnStatus.RUNNING });

    await runner.runStarted(JOB_DATA);

    expect(agentRunConversationService.openTurn).not.toHaveBeenCalled();
    expect(turnRecorderService.finish).toHaveBeenCalledTimes(1);
    expect(turnRecorderService.finish).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      turnId: 'run-id',
      status: AgentTurnStatus.FAILED,
      error: AGENT_TURN_INTERRUPTED_ERROR,
    });
    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledTimes(1);
    expect(agentRunSuspensionService.deliverOutcome).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      caller: JOB_DATA.caller,
      threadId: 'thread-id',
      outcome: {
        status: 'FAILED',
        error: AGENT_TURN_INTERRUPTED_ERROR.message,
      },
      summary: null,
    });
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
