import { Test } from '@nestjs/testing';

import { AgentChatThreadLifecycleListener } from 'src/engine/metadata-modules/ai/ai-chat/listeners/agent-chat-thread-lifecycle.listener';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { AgentTurnEventPublisherService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-event-publisher.service';

const buildListener = async () => {
  const threadLifecycleService = {
    cancelStream: jest.fn().mockResolvedValue(undefined),
    releaseThreadSandboxBestEffort: jest.fn(),
  };
  const turnEventPublisherService = {
    publishTurnsOfThreads: jest.fn().mockResolvedValue(undefined),
    publishThreadsDestroyed: jest.fn().mockResolvedValue(undefined),
  };

  const module = await Test.createTestingModule({
    providers: [
      AgentChatThreadLifecycleListener,
      {
        provide: AgentChatThreadLifecycleService,
        useValue: threadLifecycleService,
      },
      {
        provide: AgentTurnEventPublisherService,
        useValue: turnEventPublisherService,
      },
    ],
  }).compile();

  return {
    listener: module.get(AgentChatThreadLifecycleListener),
    turnEventPublisherService,
    threadLifecycleService,
  };
};

describe('AgentChatThreadLifecycleListener', () => {
  it('republishes the turns of a soft-deleted thread', async () => {
    const { listener, turnEventPublisherService } = await buildListener();

    await listener.handleDeletedThreads({
      workspaceId: 'workspace-id',
      events: [{ recordId: 'thread-id' }],
    });

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

  it('signals the destroyed thread whose turns went with it', async () => {
    const { listener, turnEventPublisherService } = await buildListener();

    await listener.handleDestroyedThreads({
      workspaceId: 'workspace-id',
      events: [
        {
          recordId: 'thread-id',
          properties: { before: { id: 'thread-id', activeStreamId: null } },
        },
      ],
    });

    expect(
      turnEventPublisherService.publishThreadsDestroyed,
    ).toHaveBeenCalledTimes(1);
    expect(
      turnEventPublisherService.publishThreadsDestroyed,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadIds: ['thread-id'],
    });
  });

  it('signals the destroyed thread even when cancelling its stream fails', async () => {
    const { listener, turnEventPublisherService, threadLifecycleService } =
      await buildListener();

    threadLifecycleService.cancelStream.mockRejectedValue(new Error('down'));

    await expect(
      listener.handleDestroyedThreads({
        workspaceId: 'workspace-id',
        events: [
          {
            recordId: 'thread-id',
            properties: {
              before: { id: 'thread-id', activeStreamId: 'stream-id' },
            },
          },
        ],
      }),
    ).rejects.toThrow('down');

    expect(
      turnEventPublisherService.publishThreadsDestroyed,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadIds: ['thread-id'],
    });
  });
});
