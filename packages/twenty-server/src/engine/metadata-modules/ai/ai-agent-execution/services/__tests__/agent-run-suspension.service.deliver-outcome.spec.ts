import { DELIVER_AGENT_RUN_OUTCOME_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/deliver-agent-run-outcome-job-name.constant';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';

const buildService = (waitingState: 'NOT_READY' | 'WAITING') => {
  const handler = {
    getWaitingState: jest.fn().mockResolvedValue(waitingState),
    onOutcome: jest.fn().mockResolvedValue(undefined),
    onCallerGone: jest.fn().mockResolvedValue(undefined),
  };
  const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };

  const service = new AgentRunSuspensionService(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    { getHandlerOrThrow: () => handler } as never,
    messageQueueService as never,
  );

  return { service, handler, messageQueueService };
};

const delivery = {
  workspaceId: 'workspace-id',
  threadId: 'thread-id',
  caller: { type: 'WORKFLOW_STEP', ref: {} },
  outcome: { status: 'COMPLETED' as const, result: { response: 'Done' } },
  summary: null,
};

describe('AgentRunSuspensionService deliverOutcome', () => {
  it('keeps retrying an outcome its caller is not ready for, past any attempt count', async () => {
    const { service, handler, messageQueueService } = buildService('NOT_READY');

    await service.deliverOutcome({ ...delivery, attempt: 500 } as never);

    expect(handler.onOutcome).not.toHaveBeenCalled();
    expect(messageQueueService.add).toHaveBeenCalledWith(
      DELIVER_AGENT_RUN_OUTCOME_JOB_NAME,
      expect.objectContaining({ outcome: delivery.outcome, attempt: 501 }),
      { delay: 60_000 },
    );
  });

  it('hands a late retry its original outcome once the caller waits', async () => {
    const { service, handler, messageQueueService } = buildService('WAITING');

    await service.deliverOutcome({ ...delivery, attempt: 500 } as never);

    expect(handler.onOutcome).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: delivery.outcome }),
    );
    expect(messageQueueService.add).not.toHaveBeenCalled();
  });
});
