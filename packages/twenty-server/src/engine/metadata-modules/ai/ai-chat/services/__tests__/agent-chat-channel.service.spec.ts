import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { AgentChatChannelMemberRole } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-member-role.enum';
import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';
import { AgentChatChannelService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel.service';

const WORKSPACE_ID = 'workspace-id';
const CHANNEL_ID = 'channel-id';
const ADMIN_ID = 'admin-user-workspace-id';
const MEMBER_ID = 'member-user-workspace-id';
const OUTSIDER_ID = 'outsider-user-workspace-id';

const buildChannel = (visibility: AgentChatChannelVisibility) => ({
  id: CHANNEL_ID,
  workspaceId: WORKSPACE_ID,
  name: 'Sales',
  visibility,
  targetObjectMetadataId: null,
  targetRecordId: null,
  createdByUserWorkspaceId: ADMIN_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const buildService = ({
  visibility = AgentChatChannelVisibility.PUBLIC,
  members = [
    {
      id: 'm-admin',
      userWorkspaceId: ADMIN_ID,
      role: AgentChatChannelMemberRole.ADMIN,
    },
    {
      id: 'm-member',
      userWorkspaceId: MEMBER_ID,
      role: AgentChatChannelMemberRole.MEMBER,
    },
  ],
} = {}) => {
  const channel = buildChannel(visibility);
  const memberRows = members.map((member) => ({
    ...member,
    channelId: CHANNEL_ID,
    workspaceId: WORKSPACE_ID,
    createdAt: new Date(),
  }));

  const channelRepository = {
    findOne: jest.fn().mockResolvedValue(channel),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    insertAndReturnOne: jest.fn(),
    update: jest.fn(),
  };
  const memberRepository = {
    findOne: jest
      .fn()
      .mockImplementation((_workspaceId, { where }) =>
        Promise.resolve(
          memberRows.find(
            (member) => member.userWorkspaceId === where.userWorkspaceId,
          ) ?? null,
        ),
      ),
    find: jest.fn().mockResolvedValue(memberRows),
    existsBy: jest
      .fn()
      .mockImplementation((_workspaceId, where) =>
        Promise.resolve(
          memberRows.some(
            (member) =>
              member.userWorkspaceId === where.userWorkspaceId &&
              member.role === where.role,
          ),
        ),
      ),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    insertAndReturnOne: jest
      .fn()
      .mockImplementation((_workspaceId, values) =>
        Promise.resolve({
          id: 'new-member',
          ...values,
          workspaceId: WORKSPACE_ID,
        }),
      ),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getExists: jest.fn().mockResolvedValue(false),
    }),
  };
  const threadRepository = {
    find: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  const userWorkspaceRepository = {
    findOne: jest.fn().mockResolvedValue({ id: OUTSIDER_ID }),
  };
  const agentChatService = {
    getThreadById: jest.fn().mockResolvedValue({
      id: 'thread-id',
      workspaceId: WORKSPACE_ID,
      channelId: null,
      userWorkspaceId: ADMIN_ID,
    }),
    assertThreadOwner: jest.fn().mockResolvedValue(undefined),
    getThreadRecipientUserWorkspaceIds: jest.fn().mockResolvedValue([ADMIN_ID]),
    getParticipantUserWorkspaceIds: jest.fn().mockResolvedValue([ADMIN_ID]),
    broadcastThreadAccessChange: jest.fn().mockResolvedValue(undefined),
  };
  const workspaceEventBroadcaster = {
    broadcast: jest.fn().mockResolvedValue(undefined),
  };

  const service = new AgentChatChannelService(
    channelRepository as never,
    memberRepository as never,
    threadRepository as never,
    userWorkspaceRepository as never,
    agentChatService as never,
    workspaceEventBroadcaster as never,
  );

  return {
    service,
    channelRepository,
    memberRepository,
    threadRepository,
    agentChatService,
    workspaceEventBroadcaster,
  };
};

describe('AgentChatChannelService', () => {
  it('lets anyone join a public channel and tells the whole workspace', async () => {
    const { service, memberRepository, workspaceEventBroadcaster } =
      buildService();

    const member = await service.joinChannel({
      channelId: CHANNEL_ID,
      userWorkspaceId: OUTSIDER_ID,
      workspaceId: WORKSPACE_ID,
    });

    expect(member.role).toBe(AgentChatChannelMemberRole.MEMBER);
    expect(memberRepository.insertAndReturnOne).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({ userWorkspaceId: OUTSIDER_ID }),
    );
    expect(workspaceEventBroadcaster.broadcast).toHaveBeenCalledWith(
      expect.objectContaining({
        events: [
          expect.objectContaining({
            entityName: 'agentChatChannelMember',
            recipientUserWorkspaceIds: undefined,
          }),
        ],
      }),
    );
  });

  it('refuses to join a private channel', async () => {
    const { service } = buildService({
      visibility: AgentChatChannelVisibility.PRIVATE,
    });

    await expect(
      service.joinChannel({
        channelId: CHANNEL_ID,
        userWorkspaceId: MEMBER_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).rejects.toMatchObject({
      code: AiExceptionCode.CHANNEL_ACTION_NOT_ALLOWED,
    });
  });

  it('only lets admins add members', async () => {
    const { service } = buildService();

    await expect(
      service.addMember({
        channelId: CHANNEL_ID,
        userWorkspaceId: OUTSIDER_ID,
        actorUserWorkspaceId: MEMBER_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).rejects.toMatchObject({
      code: AiExceptionCode.CHANNEL_ACTION_NOT_ALLOWED,
    });
  });

  it('keeps the last admin in the channel', async () => {
    const { service } = buildService();

    await expect(
      service.leaveChannel({
        channelId: CHANNEL_ID,
        userWorkspaceId: ADMIN_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).rejects.toMatchObject({
      code: AiExceptionCode.CHANNEL_ACTION_NOT_ALLOWED,
    });
  });

  it('lets a member leave a private channel and drops the channel from their list', async () => {
    const { service, memberRepository, workspaceEventBroadcaster } =
      buildService({ visibility: AgentChatChannelVisibility.PRIVATE });

    await expect(
      service.leaveChannel({
        channelId: CHANNEL_ID,
        userWorkspaceId: MEMBER_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBe(true);

    expect(memberRepository.delete).toHaveBeenCalledWith(WORKSPACE_ID, {
      id: 'm-member',
    });
    expect(workspaceEventBroadcaster.broadcast).toHaveBeenCalledWith(
      expect.objectContaining({
        events: [
          expect.objectContaining({
            type: 'deleted',
            entityName: 'agentChatChannel',
            recipientUserWorkspaceIds: [MEMBER_ID],
          }),
        ],
      }),
    );
  });

  it('moves a thread into a channel and rebroadcasts its readers', async () => {
    const { service, threadRepository, agentChatService } = buildService();

    agentChatService.getThreadRecipientUserWorkspaceIds
      .mockResolvedValueOnce([ADMIN_ID])
      .mockResolvedValueOnce(undefined);

    const thread = await service.setThreadChannel({
      threadId: 'thread-id',
      channelId: CHANNEL_ID,
      userWorkspaceId: ADMIN_ID,
      workspaceId: WORKSPACE_ID,
    });

    expect(thread.channelId).toBe(CHANNEL_ID);
    expect(agentChatService.assertThreadOwner).toHaveBeenCalled();
    expect(threadRepository.update).toHaveBeenCalledWith(
      WORKSPACE_ID,
      { id: 'thread-id' },
      { channelId: CHANNEL_ID },
    );
    expect(agentChatService.broadcastThreadAccessChange).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientsBefore: [ADMIN_ID],
        recipientsAfter: undefined,
        updatedFields: ['channelId'],
      }),
    );
  });

  it('rejects an empty channel name', async () => {
    const { service } = buildService();

    await expect(
      service.createChannel({
        input: { name: '   ' },
        userWorkspaceId: ADMIN_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_CHANNEL_NAME });
  });
});
