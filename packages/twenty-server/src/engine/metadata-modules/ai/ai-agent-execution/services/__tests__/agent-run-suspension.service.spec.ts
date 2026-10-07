import { type AgentRunSuspensionEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-run-suspension.entity';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';

const CALLER = {
  type: 'WORKFLOW_STEP' as const,
  ref: { workflowRunId: 'run-id', stepId: 'step-id' },
};

const buildSuspension = (
  overrides: Partial<AgentRunSuspensionEntity> = {},
): AgentRunSuspensionEntity =>
  ({
    id: 'suspension-id',
    workspaceId: 'workspace-id',
    threadId: 'thread-id',
    caller: CALLER,
    runSpec: null,
    summary: null,
    resumeCount: 0,
    ...overrides,
  }) as AgentRunSuspensionEntity;

const buildService = () => {
  const onOutcome = jest.fn().mockResolvedValue(undefined);
  const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };

  const service = new AgentRunSuspensionService(
    { delete: jest.fn().mockResolvedValue(undefined) } as never,
    { findOne: jest.fn().mockResolvedValue(null) } as never,
    { query: jest.fn().mockResolvedValue(undefined) } as never,
    {} as never,
    {} as never,
    { cancel: jest.fn().mockResolvedValue(undefined) } as never,
    { getHandlerOrThrow: () => ({ onOutcome }) } as never,
    messageQueueService as never,
  );

  return { service, onOutcome, messageQueueService };
};

describe('AgentRunSuspensionService', () => {
  describe('deliverAnswer', () => {
    it('hands the answer to a call the caller posted itself as its completed outcome', async () => {
      const { service, onOutcome, messageQueueService } = buildService();

      await service.deliverAnswer({
        workspaceId: 'workspace-id',
        suspension: buildSuspension(),
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
    });

    it('fails the caller when the answer cannot be read', async () => {
      const { service, onOutcome } = buildService();

      await service.deliverAnswer({
        workspaceId: 'workspace-id',
        suspension: buildSuspension(),
        toolResult: { success: true, result: { status: 'pending' } },
      });

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
        suspension: buildSuspension({ runSpec: {} as never }),
        toolResult: {},
      });

      expect(messageQueueService.add).toHaveBeenCalledTimes(1);
      expect(onOutcome).not.toHaveBeenCalled();
    });
  });
});
