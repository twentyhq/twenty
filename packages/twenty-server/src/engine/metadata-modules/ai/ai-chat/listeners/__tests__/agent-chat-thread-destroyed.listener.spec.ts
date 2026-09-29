import { AgentChatThreadDestroyedListener } from 'src/engine/metadata-modules/ai/ai-chat/listeners/agent-chat-thread-destroyed.listener';

describe('AgentChatThreadDestroyedListener', () => {
  it('cancels the streams that destroyed threads were still running', async () => {
    const lifecycleService = {
      cancelStream: jest.fn().mockResolvedValue(undefined),
    };
    const listener = new AgentChatThreadDestroyedListener(
      lifecycleService as never,
    );

    await listener.handleDestroyedThreads({
      name: 'agentChatThread.destroyed',
      workspaceId: 'workspace-id',
      objectMetadata: {} as never,
      events: [
        {
          recordId: 'streaming',
          properties: {
            before: { id: 'streaming', activeStreamId: 'stream' },
          },
        },
        {
          recordId: 'idle',
          properties: { before: { id: 'idle', activeStreamId: null } },
        },
      ] as never,
    });

    expect(lifecycleService.cancelStream).toHaveBeenCalledTimes(1);
    expect(lifecycleService.cancelStream).toHaveBeenCalledWith({
      threadId: 'streaming',
      streamId: 'stream',
    });
  });
});
