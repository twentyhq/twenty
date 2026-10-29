import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const TURN_ID = 'turn-id';

const FLAT_APPLICATION_MAPS = {
  byId: {
    'application-a-id': {
      id: 'application-a-id',
      universalIdentifier: 'application-a',
      deletedAt: null,
    },
    'application-b-id': {
      id: 'application-b-id',
      universalIdentifier: 'application-b',
      deletedAt: null,
    },
  },
};

const buildService = (senderApplicationId: string | null | undefined) => {
  const findOne = jest
    .fn()
    .mockResolvedValue(
      senderApplicationId === undefined
        ? null
        : { id: 'message-id', senderApplicationId },
    );

  const service = new AgentChatActorService(
    { findOne } as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {
      getOrRecompute: jest
        .fn()
        .mockResolvedValue({ flatApplicationMaps: FLAT_APPLICATION_MAPS }),
    } as never,
  );

  return { service, findOne };
};

describe('AgentChatActorService resolveSenderJobScope', () => {
  it.each([
    ['application-a-id', 'application-a'],
    ['application-b-id', 'application-b'],
  ])(
    'scopes a turn sent by %s to that application',
    async (senderApplicationId, applicationUniversalIdentifier) => {
      const { service } = buildService(senderApplicationId);

      await expect(
        service.resolveSenderJobScope({
          workspaceId: WORKSPACE_ID,
          threadId: THREAD_ID,
          messageId: 'message-id',
          turnId: TURN_ID,
        }),
      ).resolves.toEqual({
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier,
      });
    },
  );

  it("reads the persisted message's sender, not the caller's", async () => {
    const { service, findOne } = buildService('application-a-id');

    await service.resolveSenderJobScope({
      workspaceId: WORKSPACE_ID,
      threadId: THREAD_ID,
      messageId: 'message-id',
      turnId: TURN_ID,
    });

    expect(findOne).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({
        where: expect.objectContaining({
          threadId: THREAD_ID,
          id: 'message-id',
        }),
      }),
    );
  });

  it('keeps a member turn on the workspace scope', async () => {
    const { service } = buildService(null);

    await expect(
      service.resolveSenderJobScope({
        workspaceId: WORKSPACE_ID,
        threadId: THREAD_ID,
        messageId: 'message-id',
        turnId: TURN_ID,
      }),
    ).resolves.toEqual({ workspaceId: WORKSPACE_ID, isWorkspaceJob: true });
  });

  it('keeps a turn the agent opens, which has no user message, on the workspace scope', async () => {
    const { service, findOne } = buildService(undefined);

    await expect(
      service.resolveSenderJobScope({
        workspaceId: WORKSPACE_ID,
        threadId: THREAD_ID,
        turnId: TURN_ID,
      }),
    ).resolves.toEqual({ workspaceId: WORKSPACE_ID, isWorkspaceJob: true });
    expect(findOne).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({
        where: expect.objectContaining({ turnId: TURN_ID }),
      }),
    );
  });
});
