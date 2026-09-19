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
  description: null,
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
    withManager: jest.fn(),
  };
  channelRepository.withManager.mockReturnValue(channelRepository);
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
    insertAndReturnOne: jest.fn().mockImplementation((_workspaceId, values) =>
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
    withManager: jest.fn(),
  };
  memberRepository.withManager.mockReturnValue(memberRepository);
  const threadRepository = {
    find: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  const entityManager = { query: jest.fn().mockResolvedValue(undefined) };
  const userWorkspaceRepository = {
    findOne: jest.fn().mockResolvedValue({ id: OUTSIDER_ID }),
    manager: {
      transaction: jest
        .fn()
        .mockImplementation((run: (manager: unknown) => Promise<unknown>) =>
          run(entityManager),
        ),
    },
  };
  const agentChatService = {
    getChannelReaderUserWorkspaceIds: jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve(memberRows.map((member) => member.userWorkspaceId)),
      ),
    getThreadById: jest.fn().mockResolvedValue({
      id: 'thread-id',
      workspaceId: WORKSPACE_ID,
      channelId: null,
      userWorkspaceId: ADMIN_ID,
    }),
    assertThreadOwner: jest.fn().mockResolvedValue(undefined),
    getThreadRecipientUserWorkspaceIds: jest.fn().mockResolvedValue([ADMIN_ID]),
    getParticipantUserWorkspaceIdsByThreadId: jest
      .fn()
      .mockImplementation(({ threadIds }: { threadIds: string[] }) =>
        Promise.resolve(
          new Map(threadIds.map((threadId) => [threadId, [ADMIN_ID]])),
        ),
      ),
    broadcastThreadAccessChange: jest.fn().mockResolvedValue(undefined),
  };
  const workspaceEventBroadcaster = {
    broadcast: jest.fn().mockResolvedValue(undefined),
  };
  const channelRoleRepository = {
    findOne: jest.fn().mockResolvedValue(null),
    find: jest.fn().mockResolvedValue([]),
    insertAndReturnOne: jest.fn().mockImplementation((_workspaceId, values) =>
      Promise.resolve({
        id: 'new-channel-role',
        ...values,
        workspaceId: WORKSPACE_ID,
        createdAt: new Date(),
      }),
    ),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  const roleRepository = {
    existsBy: jest.fn().mockResolvedValue(true),
    find: jest.fn().mockResolvedValue([]),
  };
  const roleTargetRepository = {
    find: jest.fn().mockResolvedValue([]),
    existsBy: jest.fn().mockResolvedValue(false),
  };

  const service = new AgentChatChannelService(
    channelRepository as never,
    memberRepository as never,
    threadRepository as never,
    userWorkspaceRepository as never,
    agentChatService as never,
    workspaceEventBroadcaster as never,
    channelRoleRepository as never,
    roleRepository as never,
    roleTargetRepository as never,
  );

  return {
    service,
    channelRepository,
    memberRepository,
    threadRepository,
    agentChatService,
    workspaceEventBroadcaster,
    channelRoleRepository,
    roleRepository,
    roleTargetRepository,
    entityManager,
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

  it('keeps the last admin in the channel, under a per-channel lock', async () => {
    const { service, entityManager, memberRepository } = buildService();

    await expect(
      service.leaveChannel({
        channelId: CHANNEL_ID,
        userWorkspaceId: ADMIN_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).rejects.toMatchObject({
      code: AiExceptionCode.CHANNEL_ACTION_NOT_ALLOWED,
    });
    expect(entityManager.query).toHaveBeenCalledWith(
      expect.stringContaining('pg_advisory_xact_lock'),
      [`agentChatChannel:${CHANNEL_ID}`],
    );
    expect(memberRepository.delete).not.toHaveBeenCalled();
  });

  it('creates the channel and its first admin in one transaction', async () => {
    const { service, channelRepository, memberRepository, entityManager } =
      buildService();

    channelRepository.insertAndReturnOne.mockResolvedValue(
      buildChannel(AgentChatChannelVisibility.PRIVATE),
    );

    await service.createChannel({
      input: {
        name: ' Deal room ',
        visibility: AgentChatChannelVisibility.PRIVATE,
      },
      userWorkspaceId: ADMIN_ID,
      workspaceId: WORKSPACE_ID,
    });

    expect(channelRepository.withManager).toHaveBeenCalledWith(entityManager);
    expect(memberRepository.withManager).toHaveBeenCalledWith(entityManager);
    expect(channelRepository.insertAndReturnOne).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({ name: 'Deal room' }),
    );
    expect(memberRepository.insertAndReturnOne).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({ role: AgentChatChannelMemberRole.ADMIN }),
    );
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

  it('refuses to move a workflow run conversation into a channel', async () => {
    const { service, threadRepository, agentChatService } = buildService();

    agentChatService.getThreadById.mockResolvedValue({
      id: 'thread-id',
      workspaceId: WORKSPACE_ID,
      channelId: null,
      userWorkspaceId: ADMIN_ID,
      workflowRunId: 'workflow-run-id',
    });

    await expect(
      service.setThreadChannel({
        threadId: 'thread-id',
        channelId: CHANNEL_ID,
        userWorkspaceId: ADMIN_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).rejects.toMatchObject({
      code: AiExceptionCode.THREAD_ACTION_NOT_ALLOWED,
    });

    expect(threadRepository.update).not.toHaveBeenCalled();
  });

  it('resolves the readers of every thread in a channel with batched lookups on delete', async () => {
    const { service, threadRepository, agentChatService } = buildService({
      visibility: AgentChatChannelVisibility.PRIVATE,
    });

    threadRepository.find.mockResolvedValue([
      { id: 'thread-1', channelId: CHANNEL_ID },
      { id: 'thread-2', channelId: CHANNEL_ID },
    ]);

    await expect(
      service.deleteChannel({
        channelId: CHANNEL_ID,
        userWorkspaceId: ADMIN_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBe(true);

    expect(
      agentChatService.getParticipantUserWorkspaceIdsByThreadId,
    ).toHaveBeenCalledTimes(1);
    expect(
      agentChatService.getParticipantUserWorkspaceIdsByThreadId,
    ).toHaveBeenCalledWith({
      threadIds: ['thread-1', 'thread-2'],
      workspaceId: WORKSPACE_ID,
    });
    expect(
      agentChatService.getThreadRecipientUserWorkspaceIds,
    ).not.toHaveBeenCalled();
    expect(agentChatService.broadcastThreadAccessChange).toHaveBeenCalledTimes(
      2,
    );
    expect(agentChatService.broadcastThreadAccessChange).toHaveBeenCalledWith(
      expect.objectContaining({
        thread: expect.objectContaining({ id: 'thread-1', channelId: null }),
        recipientsBefore: [ADMIN_ID, MEMBER_ID],
        recipientsAfter: [ADMIN_ID],
        updatedFields: ['channelId'],
      }),
    );
  });

  it('grants a role on a private channel and tells the users it brings in', async () => {
    const {
      service,
      agentChatService,
      channelRoleRepository,
      workspaceEventBroadcaster,
    } = buildService({ visibility: AgentChatChannelVisibility.PRIVATE });

    // The readers grow once the row exists, as the database would report.
    let readerIds = [ADMIN_ID, MEMBER_ID];

    agentChatService.getChannelReaderUserWorkspaceIds.mockImplementation(() =>
      Promise.resolve([...readerIds]),
    );
    channelRoleRepository.insertAndReturnOne.mockImplementation(
      (_workspaceId, values) => {
        readerIds = [...readerIds, OUTSIDER_ID];

        return Promise.resolve({
          id: 'new-channel-role',
          ...values,
          workspaceId: WORKSPACE_ID,
          createdAt: new Date(),
        });
      },
    );

    const channelRole = await service.addRole({
      channelId: CHANNEL_ID,
      roleId: 'role-id',
      actorUserWorkspaceId: ADMIN_ID,
      workspaceId: WORKSPACE_ID,
    });

    expect(channelRole).toMatchObject({
      channelId: CHANNEL_ID,
      roleId: 'role-id',
    });
    expect(channelRoleRepository.insertAndReturnOne).toHaveBeenCalledWith(
      WORKSPACE_ID,
      { channelId: CHANNEL_ID, roleId: 'role-id' },
    );
    expect(workspaceEventBroadcaster.broadcast).toHaveBeenCalledWith(
      expect.objectContaining({
        events: [
          expect.objectContaining({
            type: 'created',
            entityName: 'agentChatChannel',
            recipientUserWorkspaceIds: [OUTSIDER_ID],
          }),
        ],
      }),
    );
    expect(workspaceEventBroadcaster.broadcast).toHaveBeenCalledWith(
      expect.objectContaining({
        events: [
          expect.objectContaining({
            type: 'created',
            entityName: 'agentChatChannelRole',
            recipientUserWorkspaceIds: [ADMIN_ID, MEMBER_ID, OUTSIDER_ID],
          }),
        ],
      }),
    );
  });

  it('only lets admins grant roles, and only roles people can hold', async () => {
    const { service, roleRepository } = buildService();

    await expect(
      service.addRole({
        channelId: CHANNEL_ID,
        roleId: 'role-id',
        actorUserWorkspaceId: MEMBER_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).rejects.toMatchObject({
      code: AiExceptionCode.CHANNEL_ACTION_NOT_ALLOWED,
    });

    roleRepository.existsBy.mockResolvedValueOnce(false);

    await expect(
      service.addRole({
        channelId: CHANNEL_ID,
        roleId: 'agent-only-role',
        actorUserWorkspaceId: ADMIN_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.ROLE_NOT_FOUND });
  });

  it('revokes a role and drops the private channel for the users it alone let in', async () => {
    const {
      service,
      agentChatService,
      channelRoleRepository,
      workspaceEventBroadcaster,
    } = buildService({ visibility: AgentChatChannelVisibility.PRIVATE });

    channelRoleRepository.findOne.mockResolvedValueOnce({
      id: 'channel-role-id',
      channelId: CHANNEL_ID,
      roleId: 'role-id',
      workspaceId: WORKSPACE_ID,
      createdAt: new Date(),
    });
    let readerIds = [ADMIN_ID, MEMBER_ID, OUTSIDER_ID];

    agentChatService.getChannelReaderUserWorkspaceIds.mockImplementation(() =>
      Promise.resolve([...readerIds]),
    );
    channelRoleRepository.delete.mockImplementation(() => {
      readerIds = [ADMIN_ID, MEMBER_ID];

      return Promise.resolve({ affected: 1 });
    });

    await expect(
      service.removeRole({
        channelId: CHANNEL_ID,
        roleId: 'role-id',
        actorUserWorkspaceId: ADMIN_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBe(true);

    expect(channelRoleRepository.delete).toHaveBeenCalledWith(WORKSPACE_ID, {
      id: 'channel-role-id',
    });
    expect(workspaceEventBroadcaster.broadcast).toHaveBeenCalledWith(
      expect.objectContaining({
        events: [
          expect.objectContaining({
            type: 'deleted',
            entityName: 'agentChatChannelRole',
            recipientUserWorkspaceIds: [ADMIN_ID, MEMBER_ID, OUTSIDER_ID],
          }),
        ],
      }),
    );
    expect(workspaceEventBroadcaster.broadcast).toHaveBeenCalledWith(
      expect.objectContaining({
        events: [
          expect.objectContaining({
            type: 'deleted',
            entityName: 'agentChatChannel',
            recipientUserWorkspaceIds: [OUTSIDER_ID],
          }),
        ],
      }),
    );
  });

  it('reports a role that is not on the channel', async () => {
    const { service } = buildService();

    await expect(
      service.removeRole({
        channelId: CHANNEL_ID,
        roleId: 'role-id',
        actorUserWorkspaceId: ADMIN_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.CHANNEL_ROLE_NOT_FOUND });
  });

  it('keeps the channel for a member who leaves but still holds one of its roles', async () => {
    const {
      service,
      channelRoleRepository,
      roleTargetRepository,
      workspaceEventBroadcaster,
    } = buildService({ visibility: AgentChatChannelVisibility.PRIVATE });

    channelRoleRepository.find.mockResolvedValueOnce([{ roleId: 'role-id' }]);
    roleTargetRepository.existsBy.mockResolvedValueOnce(true);

    await expect(
      service.leaveChannel({
        channelId: CHANNEL_ID,
        userWorkspaceId: MEMBER_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBe(true);

    expect(workspaceEventBroadcaster.broadcast).not.toHaveBeenCalledWith(
      expect.objectContaining({
        events: [
          expect.objectContaining({
            type: 'deleted',
            entityName: 'agentChatChannel',
          }),
        ],
      }),
    );
  });

  it('trims the purpose line and clears it when emptied', async () => {
    const { service, channelRepository } = buildService();

    await service.updateChannel({
      channelId: CHANNEL_ID,
      input: { description: '  Deal research  ' },
      userWorkspaceId: ADMIN_ID,
      workspaceId: WORKSPACE_ID,
    });

    expect(channelRepository.update).toHaveBeenCalledWith(
      WORKSPACE_ID,
      { id: CHANNEL_ID },
      { description: 'Deal research' },
    );

    await service.updateChannel({
      channelId: CHANNEL_ID,
      input: { description: '   ' },
      userWorkspaceId: ADMIN_ID,
      workspaceId: WORKSPACE_ID,
    });

    expect(channelRepository.update).toHaveBeenLastCalledWith(
      WORKSPACE_ID,
      { id: CHANNEL_ID },
      { description: null },
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
