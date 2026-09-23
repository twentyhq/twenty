import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';

const workspaceId = 'workspace';
const threadId = 'thread';
const sender = { userWorkspaceId: 'sender', applicationId: null };
const build = () => {
  const message = {
    id: 'message',
    threadId,
    turnId: 'turn',
    senderUserWorkspaceId: 'sender' as string | null,
    senderApplicationId: null as string | null,
    status: AgentMessageStatus.SENT,
  };
  const messages = { findOne: jest.fn().mockResolvedValue(message) };
  const threads = {
    findOneOrFail: jest.fn().mockResolvedValue({ userWorkspaceId: 'owner' }),
  };
  const chat = {
    getThreadById: jest
      .fn()
      .mockResolvedValue({ id: threadId, deletedAt: null }),
  };
  const auth = {
    resolve: jest
      .fn()
      .mockImplementation(async ({ userWorkspaceId, applicationId }) => ({
        type: 'user',
        workspace: { id: workspaceId },
        userWorkspaceId,
        user: { id: 'user' },
        workspaceMember: { id: 'member' },
        ...(applicationId
          ? { application: { id: applicationId, defaultRoleId: 'app-role' } }
          : {}),
      })),
  };
  const permissions = {
    userHasWorkspaceSettingPermission: jest.fn().mockResolvedValue(true),
  };
  const cache = {
    getOrRecompute: jest.fn().mockResolvedValue({
      userWorkspaceRoleMap: { sender: 'sender-role', owner: 'owner-role' },
    }),
  };
  const service = new AgentChatActorService(
    messages as never,
    threads as never,
    chat as never,
    auth as never,
    permissions as never,
    cache as never,
  );
  return {
    service,
    message,
    messages,
    threads,
    chat,
    auth,
    permissions,
    cache,
  };
};
const job = {
  workspaceId,
  threadId,
  messageId: 'message',
  turnId: 'turn',
  userWorkspaceId: 'sender',
};

describe('Chat execution sender', () => {
  it('executes as the saved sender rather than the thread owner', async () => {
    const { service, chat } = build();
    await expect(service.authorizeJob(job)).resolves.toMatchObject({ sender });
    expect(chat.getThreadById).toHaveBeenCalledWith({
      workspaceId,
      threadId,
      userWorkspaceId: 'sender',
    });
  });
  it('rejects a job attempting to execute another participant’s message', async () => {
    const { service, chat } = build();
    await expect(
      service.authorizeJob({ ...job, userWorkspaceId: 'owner' }),
    ).rejects.toMatchObject({ code: 'MESSAGE_NOT_FOUND' });
    expect(chat.getThreadById).not.toHaveBeenCalled();
  });
  it('rejects a mismatched turn', async () => {
    const { service } = build();
    await expect(
      service.authorizeJob({ ...job, turnId: 'other-turn' }),
    ).rejects.toMatchObject({ code: 'MESSAGE_NOT_FOUND' });
  });
  it('does not execute a message still in the queue', async () => {
    const { service, message } = build();
    message.status = AgentMessageStatus.QUEUED;
    await expect(service.authorizeJob(job)).rejects.toMatchObject({
      code: 'MESSAGE_NOT_FOUND',
    });
  });
  it('uses the original participant for historical messages without attribution', async () => {
    const { service, message } = build();
    message.senderUserWorkspaceId = null;
    await expect(
      service.authorizeJob({ ...job, userWorkspaceId: 'owner' }),
    ).resolves.toMatchObject({
      sender: { userWorkspaceId: 'owner', applicationId: null },
    });
    await expect(service.authorizeJob(job)).rejects.toMatchObject({
      code: 'MESSAGE_NOT_FOUND',
    });
  });
  it('resolves old queued job payloads from their persisted turn', async () => {
    const { service, messages } = build();
    await service.authorizeJob({ ...job, messageId: undefined });
    expect(messages.findOne).toHaveBeenCalledWith(
      workspaceId,
      expect.objectContaining({
        where: { threadId, turnId: 'turn', role: 'user' },
      }),
    );
  });
  it('rejects jobs without a durable message or turn identity', async () => {
    const { service, messages } = build();
    await expect(
      service.authorizeJob({ ...job, messageId: undefined, turnId: undefined }),
    ).rejects.toMatchObject({ code: 'MESSAGE_NOT_FOUND' });
    expect(messages.findOne).not.toHaveBeenCalled();
  });
  it('intersects current sender and application roles', async () => {
    const { service } = build();
    await expect(
      service.authorize({
        workspaceId,
        threadId,
        sender: { ...sender, applicationId: 'app' },
      }),
    ).resolves.toMatchObject({
      rolePermissionConfig: { intersectionOf: ['sender-role', 'app-role'] },
    });
  });
  it('does not inherit ambient request application restrictions from another participant', async () => {
    const { service, auth } = build();
    await service.authorize({ workspaceId, threadId, sender });
    expect(auth.resolve).toHaveBeenCalledWith({ workspaceId, ...sender });
  });
  it('checks live membership again after a message has been accepted', async () => {
    const { service, auth } = build();
    await service.authorizeJob(job);
    auth.resolve.mockRejectedValue(new Error('Membership removed'));
    await expect(service.authorizeJob(job)).rejects.toThrow(
      'Membership removed',
    );
  });
  it('checks the current thread permission before execution', async () => {
    const { service, chat } = build();
    chat.getThreadById.mockRejectedValue(new Error('Access revoked'));
    await expect(service.authorizeJob(job)).rejects.toThrow('Access revoked');
  });
  it('denies revoked AI permission', async () => {
    const { service, permissions } = build();
    permissions.userHasWorkspaceSettingPermission.mockResolvedValue(false);
    await expect(service.authorizeJob(job)).rejects.toMatchObject({
      code: 'THREAD_NOT_FOUND',
    });
  });
  it('denies archived threads', async () => {
    const { service, chat } = build();
    chat.getThreadById.mockResolvedValue({
      id: threadId,
      deletedAt: new Date(),
    } as never);
    await expect(service.authorizeJob(job)).rejects.toMatchObject({
      code: 'THREAD_NOT_FOUND',
    });
  });
  it('denies a sender without a current role', async () => {
    const { service, cache } = build();
    cache.getOrRecompute.mockResolvedValue({ userWorkspaceRoleMap: {} });
    await expect(service.authorizeJob(job)).rejects.toMatchObject({
      code: 'THREAD_NOT_FOUND',
    });
  });
  it.each([null, 'other-app'])(
    'rejects retrying an application message from a different context (%s)',
    async (applicationId) => {
      const { service, message } = build();
      message.senderApplicationId = 'original-app';
      await expect(
        withWorkspaceAuthContext(
          {
            type: 'user',
            workspace: { id: workspaceId },
            userWorkspaceId: 'sender',
            application: applicationId ? { id: applicationId } : undefined,
          } as never,
          () => service.authorizeRetry(job),
        ),
      ).rejects.toMatchObject({ code: 'MESSAGE_NOT_FOUND' });
    },
  );

  it('allows retrying in the original sender and application context', async () => {
    const { service, message } = build();
    message.senderApplicationId = 'original-app';
    await expect(
      withWorkspaceAuthContext(
        {
          type: 'user',
          workspace: { id: workspaceId },
          userWorkspaceId: 'sender',
          application: { id: 'original-app' },
        } as never,
        () => service.authorizeRetry(job),
      ),
    ).resolves.toMatchObject({
      sender: { userWorkspaceId: 'sender', applicationId: 'original-app' },
    });
  });
  it.each([null, 'other-app'])(
    'rejects answering an application question from a different context (%s)',
    async (applicationId) => {
      const { service, message } = build();
      message.senderApplicationId = 'original-app';
      await expect(
        withWorkspaceAuthContext(
          {
            type: 'user',
            workspace: { id: workspaceId },
            userWorkspaceId: 'sender',
            application: applicationId ? { id: applicationId } : undefined,
          } as never,
          () => service.authorizeQuestionAnswer(job),
        ),
      ).rejects.toMatchObject({ code: 'INVALID_QUESTION_ANSWER' });
    },
  );

  it.each([null, 'original-app'])(
    'allows another participant to answer in the same application context (%s)',
    async (applicationId) => {
      const { service, message } = build();
      message.senderApplicationId = applicationId;
      await expect(
        withWorkspaceAuthContext(
          {
            type: 'user',
            workspace: { id: workspaceId },
            userWorkspaceId: 'another-participant',
            application: applicationId ? { id: applicationId } : undefined,
          } as never,
          () => service.authorizeQuestionAnswer(job),
        ),
      ).resolves.toBeUndefined();
    },
  );

  it('rejects an answer without an authenticated request context', async () => {
    const { service } = build();
    await expect(service.authorizeQuestionAnswer(job)).rejects.toMatchObject({
      code: 'INVALID_QUESTION_ANSWER',
    });
  });
});
