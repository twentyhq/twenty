import { AgentChatThreadLifecycleListener } from 'src/engine/metadata-modules/ai/ai-chat/listeners/agent-chat-thread-lifecycle.listener';

const buildListener = () => {
  const threadLifecycleService = {
    cancelStream: jest.fn().mockResolvedValue(undefined),
    releaseThreadSandboxBestEffort: jest.fn(),
  };
  const turnEventPublisherService = {
    publishTurnsOfThreads: jest.fn().mockResolvedValue(undefined),
    publishTurnsDestroyedWithThreads: jest.fn().mockResolvedValue(undefined),
  };

  return {
    listener: new AgentChatThreadLifecycleListener(
      threadLifecycleService as never,
      turnEventPublisherService as never,
    ),
    turnEventPublisherService,
  };
};

describe('AgentChatThreadLifecycleListener', () => {
  it('republishes the turns of a soft-deleted thread', async () => {
    const { listener, turnEventPublisherService } = buildListener();

    await listener.handleDeletedThreads({
      workspaceId: 'workspace-id',
      events: [{ recordId: 'thread-id' }],
    } as never);

    expect(
      turnEventPublisherService.publishTurnsOfThreads,
    ).toHaveBeenCalledTimes(1);
    expect(
      turnEventPublisherService.publishTurnsOfThreads,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadIds: ['thread-id'],
    });
  });

  it('publishes the turns removed with a destroyed thread', async () => {
    const { listener, turnEventPublisherService } = buildListener();

    await listener.handleDestroyedThreads({
      workspaceId: 'workspace-id',
      events: [
        {
          recordId: 'thread-id',
          properties: { before: { id: 'thread-id', activeStreamId: null } },
        },
      ],
    } as never);

    expect(
      turnEventPublisherService.publishTurnsDestroyedWithThreads,
    ).toHaveBeenCalledTimes(1);
    expect(
      turnEventPublisherService.publishTurnsDestroyedWithThreads,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadIds: ['thread-id'],
    });
  });
});
