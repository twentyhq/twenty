import { AgentChatWaitingRunService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-waiting-run.service';

const WORKSPACE_ID = 'workspace-id';

const buildService = (payload: object) => {
  const messageQueueService = { add: jest.fn().mockResolvedValue('job-id') };

  const service = new AgentChatWaitingRunService(
    {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 'thread-id', activeStreamId: null }),
    } as never,
    {} as never,
    { claim: jest.fn().mockResolvedValue({ payload }) } as never,
    {} as never,
    messageQueueService as never,
    {} as never,
  );

  return { service, messageQueueService };
};

const wakeUp = {
  id: 'wake-up-id',
  workspaceId: WORKSPACE_ID,
  ownerId: 'thread-id',
};

describe('AgentChatWaitingRunService resolve', () => {
  it('requeues a waiting run with the scope it was parked with', async () => {
    const scope = {
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: 'application-a',
    };
    const { service, messageQueueService } = buildService({
      jobName: 'RunAgentJob',
      jobData: { threadId: 'thread-id' },
      scope,
    });

    await service.resolve({ wakeUp: wakeUp as never });

    expect(messageQueueService.add).toHaveBeenCalledWith(
      'RunAgentJob',
      { threadId: 'thread-id' },
      scope,
    );
  });

  it('requeues a run parked without a scope as a workspace job', async () => {
    const { service, messageQueueService } = buildService({
      jobName: 'RunAgentJob',
      jobData: { threadId: 'thread-id' },
    });

    await service.resolve({ wakeUp: wakeUp as never });

    expect(messageQueueService.add).toHaveBeenCalledWith(
      'RunAgentJob',
      { threadId: 'thread-id' },
      { workspaceId: WORKSPACE_ID, isWorkspaceJob: true },
    );
  });
});
