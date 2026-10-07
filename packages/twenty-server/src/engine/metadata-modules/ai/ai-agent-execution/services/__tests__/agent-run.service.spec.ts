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
    runSpec: null,
    summary: null,
    status: 'SUSPENDED',
    outcome: null,
    resumeCount: 0,
    ...overrides,
  }) as AgentRunEntity;

const buildService = () => {
  const onOutcome = jest.fn().mockResolvedValue(undefined);
  const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };
  const runRepository = {
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  const pendingWakeUpService = {
    cancel: jest.fn().mockResolvedValue(undefined),
  };

  const service = new AgentRunService(
    runRepository as never,
    { findOne: jest.fn().mockResolvedValue(null) } as never,
    { query: jest.fn().mockResolvedValue(undefined) } as never,
    {} as never,
    pendingWakeUpService as never,
    { getHandlerOrThrow: () => ({ onOutcome }) } as never,
    messageQueueService as never,
  );

  return {
    service,
    onOutcome,
    messageQueueService,
    runRepository,
    pendingWakeUpService,
  };
};

describe('AgentRunService', () => {
  describe('deliverAnswer', () => {
    it('hands the answer to a call the caller posted itself as its completed outcome', async () => {
      const { service, onOutcome, messageQueueService, runRepository } =
        buildService();

      await service.deliverAnswer({
        workspaceId: 'workspace-id',
        run: buildRun(),
        toolResult: {
          success: true,
          result: {
            status: 'approved',
            proposal: {
              toolName: 'update_one_company',
              arguments: { id: 'company-id', employees: 25 },
            },
            output: { id: 'company-id' },
          },
        },
      });

      expect(messageQueueService.add).not.toHaveBeenCalled();
      expect(onOutcome).toHaveBeenCalledTimes(1);
      expect(onOutcome).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        caller: CALLER,
        threadId: 'thread-id',
        outcome: {
          status: 'COMPLETED',
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
        summary: null,
      });
      expect(runRepository.update).toHaveBeenCalledWith(
        'workspace-id',
        { id: 'run-id' },
        expect.objectContaining({
          status: 'COMPLETED',
          outcome: {
            result: expect.objectContaining({ outcome: 'executed' }),
          },
        }),
      );
    });

    it('fails the caller when the answer cannot be read', async () => {
      const { service, onOutcome } = buildService();

      await service.deliverAnswer({
        workspaceId: 'workspace-id',
        run: buildRun(),
        toolResult: { success: true, result: { status: 'pending' } },
      });

      expect(onOutcome).toHaveBeenCalledTimes(1);
      expect(onOutcome).toHaveBeenCalledWith(
        expect.objectContaining({
          outcome: {
            status: 'FAILED',
            error: 'The answer to the proposed call could not be read',
          },
        }),
      );
    });

    it('continues a suspended agent run instead of settling it', async () => {
      const { service, onOutcome, messageQueueService } = buildService();

      await service.deliverAnswer({
        workspaceId: 'workspace-id',
        run: buildRun({ runSpec: {} as never }),
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
        { id: 'run-id' },
        { status: 'CANCELLED' },
      );
      expect(onOutcome).not.toHaveBeenCalled();
    });
  });
});
