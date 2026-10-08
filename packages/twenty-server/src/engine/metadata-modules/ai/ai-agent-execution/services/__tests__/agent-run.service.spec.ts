import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { CONTINUE_AGENT_RUN_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/continue-agent-run-job-name.constant';
import { type AgentRunEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-run.entity';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';

const CALLER = {
  type: 'WORKFLOW_STEP' as const,
  ref: { workflowRunId: 'run-id', stepId: 'step-id' },
};

const buildRun = (overrides: Partial<AgentRunEntity> = {}): AgentRunEntity =>
  ({
    id: 'run-id',
    workspaceId: 'workspace-id',
    threadId: 'thread-id',
    caller: CALLER,
    runSpec: {},
    summary: null,
    status: 'SUSPENDED',
    outcome: null,
    resumeCount: 0,
    ...overrides,
  }) as AgentRunEntity;

const ANSWER_WAKE_UP = {
  id: 'wake-up-id',
  workspaceId: 'workspace-id',
  ownerType: 'WORKFLOW_STEP',
  ownerId: 'workflow-run-id',
  ownerKey: 'step-id',
  condition: { type: 'ANSWER', threadId: 'thread-id', toolCallId: 'call-id' },
} as PendingWakeUpEntity;

const buildService = ({
  answerWakeUp = null as PendingWakeUpEntity | null,
  suspendedRun = null as AgentRunEntity | null,
} = {}) => {
  const onOutcome = jest.fn().mockResolvedValue(undefined);
  const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };
  const runRepository = {
    findOne: jest.fn().mockResolvedValue(suspendedRun),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  const pendingWakeUpService = {
    cancel: jest.fn().mockResolvedValue([]),
    claim: jest.fn().mockResolvedValue(null),
    findAnswerWakeUp: jest.fn().mockResolvedValue(answerWakeUp),
  };
  const pendingWakeUpResolverService = {
    resolve: jest.fn().mockResolvedValue(undefined),
  };

  const messagePartRepository = {
    query: jest.fn().mockResolvedValue(undefined),
  };

  const service = new AgentRunService(
    runRepository as never,
    { findOne: jest.fn().mockResolvedValue(null) } as never,
    messagePartRepository as never,
    {} as never,
    pendingWakeUpService as never,
    {
      getHandlerOrThrow: () => ({
        getOwnerState: jest.fn().mockResolvedValue({ status: 'WAITING' }),
      }),
    } as never,
    pendingWakeUpResolverService as never,
    {
      getHandlerOrThrow: () => ({
        onOutcome,
        getWaitingState: jest.fn().mockResolvedValue('WAITING'),
      }),
    } as never,
    messageQueueService as never,
  );

  return {
    service,
    onOutcome,
    messageQueueService,
    runRepository,
    pendingWakeUpService,
    pendingWakeUpResolverService,
    messagePartRepository,
  };
};

const APPROVED_TOOL_RESULT = {
  success: true,
  result: {
    status: 'approved',
    proposal: {
      toolName: 'update_one_company',
      arguments: { id: 'company-id', employees: 25 },
    },
    output: { id: 'company-id' },
  },
};

describe('AgentRunService', () => {
  describe('findAwaiter', () => {
    it('finds the wake-up of the caller that posted the call before any run', async () => {
      const { service, runRepository } = buildService({
        answerWakeUp: ANSWER_WAKE_UP,
        suspendedRun: buildRun(),
      });

      expect(
        await service.findAwaiter({
          workspaceId: 'workspace-id',
          threadId: 'thread-id',
          toolCallId: 'call-id',
        }),
      ).toEqual({ status: 'WAITING', wakeUp: ANSWER_WAKE_UP });
      expect(runRepository.findOne).not.toHaveBeenCalled();
    });

    it('finds the run suspended in the conversation, which asked the call', async () => {
      const run = buildRun();
      const { service } = buildService({ suspendedRun: run });

      expect(
        await service.findAwaiter({
          workspaceId: 'workspace-id',
          threadId: 'thread-id',
          toolCallId: 'call-id',
        }),
      ).toEqual({ status: 'WAITING', run });
    });

    it('finds nothing for a call no caller waits on', async () => {
      const { service } = buildService();

      expect(
        await service.findAwaiter({
          workspaceId: 'workspace-id',
          threadId: 'thread-id',
          toolCallId: 'call-id',
        }),
      ).toBeNull();
    });
  });

  describe('deliverAnswer', () => {
    it('resolves the wake-up of the caller that posted the call with the answer', async () => {
      const { service, onOutcome, pendingWakeUpResolverService } =
        buildService();

      await service.deliverAnswer({
        workspaceId: 'workspace-id',
        threadId: 'thread-id',
        awaiter: { status: 'WAITING', wakeUp: ANSWER_WAKE_UP },
        toolResult: APPROVED_TOOL_RESULT,
      });

      expect(onOutcome).not.toHaveBeenCalled();
      expect(pendingWakeUpResolverService.resolve).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        wakeUpId: 'wake-up-id',
        answer: {
          result: {
            threadId: 'thread-id',
            outcome: 'executed',
            toolName: 'update_one_company',
            arguments: { id: 'company-id', employees: 25 },
            output: { id: 'company-id' },
            feedback: null,
            error: null,
          },
        },
      });
    });

    it('fails the caller when the answer cannot be read', async () => {
      const { service, pendingWakeUpResolverService } = buildService();

      await service.deliverAnswer({
        workspaceId: 'workspace-id',
        threadId: 'thread-id',
        awaiter: { status: 'WAITING', wakeUp: ANSWER_WAKE_UP },
        toolResult: { success: true, result: { status: 'pending' } },
      });

      expect(pendingWakeUpResolverService.resolve).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        wakeUpId: 'wake-up-id',
        answer: { error: 'The answer to the proposed call could not be read' },
      });
    });

    it('continues a suspended agent run', async () => {
      const { service, onOutcome, messageQueueService } = buildService();

      await service.deliverAnswer({
        workspaceId: 'workspace-id',
        threadId: 'thread-id',
        awaiter: { status: 'WAITING', run: buildRun() },
        toolResult: {},
      });

      expect(messageQueueService.add).toHaveBeenCalledTimes(1);
      expect(messageQueueService.add).toHaveBeenCalledWith(
        CONTINUE_AGENT_RUN_JOB_NAME,
        {
          workspaceId: 'workspace-id',
          runId: 'run-id',
          resumeCount: 0,
        },
      );
      expect(onOutcome).not.toHaveBeenCalled();
    });
  });

  describe('release', () => {
    it('keeps a dropped run as cancelled and stops its wake-ups', async () => {
      const { service, onOutcome, runRepository, pendingWakeUpService } =
        buildService();

      await service.release({ workspaceId: 'workspace-id', run: buildRun() });

      expect(pendingWakeUpService.cancel).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        owner: { type: 'AGENT_RUN', id: 'run-id' },
      });
      expect(runRepository.update).toHaveBeenCalledWith(
        'workspace-id',
        expect.objectContaining({ id: 'run-id' }),
        { status: 'CANCELLED' },
      );
      expect(onOutcome).not.toHaveBeenCalled();
    });
  });

  describe('settle', () => {
    it('leaves a run its caller dropped while it went on as it ended', async () => {
      const {
        service,
        onOutcome,
        runRepository,
        pendingWakeUpService,
        messagePartRepository,
      } = buildService();

      runRepository.update.mockResolvedValue({ affected: 0 });

      await service.settle({
        workspaceId: 'workspace-id',
        run: buildRun(),
        outcome: { status: 'COMPLETED', result: { answer: 'done' } },
      });

      expect(runRepository.update).toHaveBeenCalledWith(
        'workspace-id',
        {
          id: 'run-id',
          status: expect.objectContaining({ _value: ['RUNNING', 'SUSPENDED'] }),
        },
        expect.objectContaining({ status: 'COMPLETED' }),
      );
      expect(pendingWakeUpService.cancel).not.toHaveBeenCalled();
      expect(messagePartRepository.query).not.toHaveBeenCalled();
      expect(onOutcome).not.toHaveBeenCalled();
    });
  });
});
