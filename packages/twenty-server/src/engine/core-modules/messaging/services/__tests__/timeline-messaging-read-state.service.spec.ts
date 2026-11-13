import { TimelineMessagingService } from 'src/engine/core-modules/messaging/services/timeline-messaging.service';

const buildServiceWithoutReadState = () => {
  const workspaceOrmManager = {
    executeInWorkspaceContext: jest.fn(),
    getRepositoryWithoutPermissionChecks: jest.fn(),
  };
  const messageChannelRepository = {
    find: jest.fn().mockResolvedValue([{ id: 'owned-channel-id' }]),
  };
  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue({
      flatFieldMetadataMaps: { byUniversalIdentifier: {} },
    }),
  };

  const service = new TimelineMessagingService(
    workspaceOrmManager as never,
    messageChannelRepository as never,
    {} as never,
    workspaceCacheService as never,
    {} as never,
    {} as never,
  );

  return { service, workspaceOrmManager, messageChannelRepository };
};

describe('TimelineMessagingService read state before the isRead upgrade', () => {
  it('reports every thread read without querying the missing column', async () => {
    const { service, workspaceOrmManager } = buildServiceWithoutReadState();

    const unreadMessageThreadIds = await service.findUnreadMessageThreadIds({
      messageThreadIds: ['thread-id'],
      userWorkspaceId: 'user-workspace-id',
      workspaceId: 'workspace-id',
    });

    expect(unreadMessageThreadIds.size).toBe(0);
    expect(
      workspaceOrmManager.executeInWorkspaceContext,
    ).not.toHaveBeenCalled();
  });

  it('ignores marking a thread read without touching the missing column', async () => {
    const { service, workspaceOrmManager, messageChannelRepository } =
      buildServiceWithoutReadState();

    await service.markMessageThreadAsRead({
      messageThreadId: 'thread-id',
      userWorkspaceId: 'user-workspace-id',
      workspaceId: 'workspace-id',
    });

    expect(messageChannelRepository.find).not.toHaveBeenCalled();
    expect(
      workspaceOrmManager.executeInWorkspaceContext,
    ).not.toHaveBeenCalled();
  });
});
