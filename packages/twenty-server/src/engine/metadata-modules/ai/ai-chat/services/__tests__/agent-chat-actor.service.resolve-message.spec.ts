import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const TURN_ID = 'turn-id';
const OWNER_WORKSPACE_MEMBER_ID = 'owner-workspace-member-id';
const SENDER_WORKSPACE_MEMBER_ID = 'sender-workspace-member-id';
const APPLICATION_ID = 'application-id';

const USER_WORKSPACE_ID_BY_WORKSPACE_MEMBER_ID: Record<string, string> = {
  [OWNER_WORKSPACE_MEMBER_ID]: 'owner-user-workspace-id',
  [SENDER_WORKSPACE_MEMBER_ID]: 'sender-user-workspace-id',
};

const buildService = (
  message: {
    senderWorkspaceMemberId: string | null;
    senderApplicationId: string | null;
  } | null,
) => {
  const resolveWorkspaceMember = jest.fn(
    async ({ workspaceMemberId }: { workspaceMemberId: string }) => ({
      userWorkspaceId:
        USER_WORKSPACE_ID_BY_WORKSPACE_MEMBER_ID[workspaceMemberId],
    }),
  );

  const service = new AgentChatActorService(
    {
      findOne: jest
        .fn()
        .mockResolvedValue(
          message === null
            ? null
            : { id: 'message-id', turnId: TURN_ID, ...message },
        ),
    } as never,
    {
      findOneOrFail: jest.fn().mockResolvedValue({
        id: THREAD_ID,
        workspaceMemberId: OWNER_WORKSPACE_MEMBER_ID,
      }),
    } as never,
    {} as never,
    { resolveWorkspaceMember } as never,
    {} as never,
    {} as never,
  );

  return { service, resolveWorkspaceMember };
};

const resolveSender = async (
  service: AgentChatActorService,
): Promise<unknown> =>
  (
    await service.resolveMessage({
      workspaceId: WORKSPACE_ID,
      threadId: THREAD_ID,
      turnId: TURN_ID,
    })
  ).sender;

describe('AgentChatActorService resolveMessage', () => {
  it('runs a member message as its sender', async () => {
    const { service } = buildService({
      senderWorkspaceMemberId: SENDER_WORKSPACE_MEMBER_ID,
      senderApplicationId: null,
    });

    await expect(resolveSender(service)).resolves.toEqual({
      userWorkspaceId: 'sender-user-workspace-id',
      applicationId: null,
    });
  });

  it('runs a turn the agent opened as the thread owner', async () => {
    const { service } = buildService(null);

    await expect(resolveSender(service)).resolves.toEqual({
      userWorkspaceId: 'owner-user-workspace-id',
      applicationId: null,
    });
  });

  it('runs an application message as the thread owner, through the application', async () => {
    const { service } = buildService({
      senderWorkspaceMemberId: null,
      senderApplicationId: APPLICATION_ID,
    });

    await expect(resolveSender(service)).resolves.toEqual({
      userWorkspaceId: 'owner-user-workspace-id',
      applicationId: APPLICATION_ID,
    });
  });

  it('refuses a member message whose sender has left, rather than running it as the owner', async () => {
    const { service, resolveWorkspaceMember } = buildService({
      senderWorkspaceMemberId: null,
      senderApplicationId: null,
    });

    await expect(resolveSender(service)).rejects.toMatchObject({
      code: AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_FOUND,
    });
    expect(resolveWorkspaceMember).not.toHaveBeenCalled();
  });
});
