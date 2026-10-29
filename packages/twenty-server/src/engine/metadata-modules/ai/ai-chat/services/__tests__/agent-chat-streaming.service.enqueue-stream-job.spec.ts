import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { STREAM_AGENT_CHAT_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job-name.constant';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';

const SENDER_APPLICATION_ID_BY_MESSAGE_ID: Record<string, string | null> = {
  'message-from-application-a': 'application-a-id',
  'message-from-application-b': 'application-b-id',
  'message-from-member': null,
};

const buildService = () => {
  const add = jest.fn().mockResolvedValue(undefined);
  const actorService = new AgentChatActorService(
    {
      findOne: jest.fn(
        async (_workspaceId: string, { where }: { where: { id?: string } }) =>
          where.id === undefined
            ? null
            : {
                id: where.id,
                senderApplicationId:
                  SENDER_APPLICATION_ID_BY_MESSAGE_ID[where.id],
              },
      ),
    } as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatApplicationMaps: {
          byId: {
            'application-a-id': {
              universalIdentifier: 'application-a',
              deletedAt: null,
            },
            'application-b-id': {
              universalIdentifier: 'application-b',
              deletedAt: null,
            },
          },
        },
      }),
    } as never,
  );

  const service = new AgentChatStreamingService(
    {
      findOneOrFail: jest.fn().mockResolvedValue({
        id: THREAD_ID,
        title: 'Thread',
        conversationSize: 0,
      }),
    } as never,
    {} as never,
    { add } as never,
    {
      getMessagesForThread: jest.fn().mockResolvedValue([]),
      getThreadContexts: jest.fn().mockResolvedValue([]),
    } as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    actorService,
    {} as never,
    {} as never,
    {} as never,
  );

  return { service, add };
};

const enqueue = (
  service: AgentChatStreamingService,
  messageId: string | undefined,
) =>
  service.enqueueStreamJob({
    threadId: THREAD_ID,
    workspaceId: WORKSPACE_ID,
    streamId: 'stream-id',
    userWorkspaceId: 'user-workspace-id',
    workspaceMemberId: 'workspace-member-id',
    messageId,
    turnId: 'turn-id',
  });

describe('AgentChatStreamingService enqueueStreamJob', () => {
  it("scopes each stream job to its message's application sender", async () => {
    const { service, add } = buildService();

    await enqueue(service, 'message-from-application-a');
    await enqueue(service, 'message-from-application-b');

    expect(
      add.mock.calls.map(([jobName, , options]) => [jobName, options]),
    ).toEqual([
      [
        STREAM_AGENT_CHAT_JOB_NAME,
        {
          workspaceId: WORKSPACE_ID,
          applicationUniversalIdentifier: 'application-a',
        },
      ],
      [
        STREAM_AGENT_CHAT_JOB_NAME,
        {
          workspaceId: WORKSPACE_ID,
          applicationUniversalIdentifier: 'application-b',
        },
      ],
    ]);
  });

  it('keeps member and opening turns on the workspace scope', async () => {
    const { service, add } = buildService();

    await enqueue(service, 'message-from-member');
    await enqueue(service, undefined);

    expect(add.mock.calls.map(([, , options]) => options)).toEqual([
      { workspaceId: WORKSPACE_ID, isWorkspaceJob: true },
      { workspaceId: WORKSPACE_ID, isWorkspaceJob: true },
    ]);
  });
});
