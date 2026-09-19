import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';

const WORKSPACE_ID = 'workspace-id';
const THREAD = { id: 'thread-id', workspaceId: WORKSPACE_ID } as never;

const buildService = ({
  workspaceUserWorkspaceIds = ['uw-a', 'uw-b', 'uw-c'],
} = {}) => {
  const service = Object.create(AgentChatService.prototype) as AgentChatService;

  const broadcastThreadCreatedToRecipients = jest
    .fn()
    .mockResolvedValue(undefined);
  const broadcastThreadDeletedToRecipients = jest
    .fn()
    .mockResolvedValue(undefined);
  const broadcastThreadUpdated = jest.fn().mockResolvedValue(undefined);

  Object.assign(service, {
    broadcastThreadCreatedToRecipients,
    broadcastThreadDeletedToRecipients,
    broadcastThreadUpdated,
    getWorkspaceUserWorkspaceIds: jest
      .fn()
      .mockResolvedValue(workspaceUserWorkspaceIds),
  });

  return {
    service,
    broadcastThreadCreatedToRecipients,
    broadcastThreadDeletedToRecipients,
    broadcastThreadUpdated,
  };
};

describe('AgentChatService.broadcastThreadAccessChange', () => {
  it('takes a thread off the workspace and tells the rest what changed', async () => {
    const {
      service,
      broadcastThreadCreatedToRecipients,
      broadcastThreadDeletedToRecipients,
      broadcastThreadUpdated,
    } = buildService();

    await service.broadcastThreadAccessChange({
      thread: THREAD,
      recipientsBefore: undefined,
      recipientsAfter: ['uw-a'],
      updatedFields: ['channelId'],
    });

    expect(broadcastThreadDeletedToRecipients).toHaveBeenCalledWith(
      expect.objectContaining({ recipientUserWorkspaceIds: ['uw-b', 'uw-c'] }),
    );
    // Everybody could read it a moment ago, so nobody is gaining it.
    expect(broadcastThreadCreatedToRecipients).not.toHaveBeenCalled();
    expect(broadcastThreadUpdated).toHaveBeenCalledWith(THREAD, ['channelId'], {
      userWorkspaceIds: ['uw-a'],
    });
  });

  it('says nothing to the readers it keeps when no field of the thread changed', async () => {
    const { service, broadcastThreadUpdated } = buildService();

    await service.broadcastThreadAccessChange({
      thread: THREAD,
      recipientsBefore: undefined,
      recipientsAfter: ['uw-a'],
      updatedFields: [],
    });

    expect(broadcastThreadUpdated).not.toHaveBeenCalled();
  });

  it('still hands the thread to readers who did not have it', async () => {
    const { service, broadcastThreadCreatedToRecipients } = buildService();

    await service.broadcastThreadAccessChange({
      thread: THREAD,
      recipientsBefore: ['uw-a'],
      recipientsAfter: ['uw-a', 'uw-b'],
      updatedFields: ['channelId'],
    });

    expect(broadcastThreadCreatedToRecipients).toHaveBeenCalledWith(
      expect.objectContaining({ recipientUserWorkspaceIds: ['uw-b'] }),
    );
  });

  // An update is only something to apply for somebody already holding the
  // thread. The rest of the workspace has nothing to update, so they are
  // handed the thread instead of being told one they never had changed.
  it('hands the thread to the workspace when it becomes public', async () => {
    const {
      service,
      broadcastThreadCreatedToRecipients,
      broadcastThreadUpdated,
    } = buildService();

    await service.broadcastThreadAccessChange({
      thread: THREAD,
      recipientsBefore: ['uw-a'],
      recipientsAfter: undefined,
      updatedFields: ['channelId'],
    });

    expect(broadcastThreadCreatedToRecipients).toHaveBeenCalledWith({
      thread: THREAD,
      recipientUserWorkspaceIds: ['uw-b', 'uw-c'],
    });
    expect(broadcastThreadUpdated).toHaveBeenCalledWith(THREAD, ['channelId'], {
      userWorkspaceIds: ['uw-a'],
    });
  });

  it('updates the whole workspace when a thread that was already public changes', async () => {
    const {
      service,
      broadcastThreadCreatedToRecipients,
      broadcastThreadUpdated,
    } = buildService();

    await service.broadcastThreadAccessChange({
      thread: THREAD,
      recipientsBefore: undefined,
      recipientsAfter: undefined,
      updatedFields: ['title'],
    });

    expect(broadcastThreadUpdated).toHaveBeenCalledWith(THREAD, ['title'], {
      userWorkspaceIds: undefined,
    });
    expect(broadcastThreadCreatedToRecipients).not.toHaveBeenCalled();
  });
});
