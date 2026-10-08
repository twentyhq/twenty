import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { AgentChatThreadCreateManyPostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-create-many.post-query.hook';
import { AgentChatThreadCreateOnePostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-create-one.post-query.hook';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const CREATOR_ID = 'creator-member-id';
const CREATOR_USER_WORKSPACE_ID = 'creator-user-workspace-id';
const PARTICIPANT_OBJECT_METADATA_ID = 'participant-object-metadata-id';
const LAST_ACTIVITY_AT = '2026-10-07T10:00:00.000Z';

const creatorAuthContext = {
  type: 'user',
  workspace: { id: WORKSPACE_ID },
  workspaceMemberId: CREATOR_ID,
  userWorkspaceId: CREATOR_USER_WORKSPACE_ID,
} as unknown as WorkspaceAuthContext;

type Thread = {
  id: string;
  workspaceMemberId: string | null;
  lastActivityAt: string | null;
};

// Stands in for the thread and participant tables, applying the inbox setup
// the way its SQL does
const buildStorage = (threads: Thread[]) => {
  const participants: {
    threadId: string;
    workspaceMemberId: string;
    lastReadAt: string | null;
  }[] = [];

  const setUpInboxState = (sql: string, parameters: unknown[]) => {
    expect(sql).toContain('SET "lastActivityAt" = clock_timestamp()');

    const [threadIds, workspaceMemberId] = parameters as [string[], string];
    const setUpThreads = threads.filter(
      (thread) =>
        threadIds.includes(thread.id) && thread.lastActivityAt === null,
    );

    for (const thread of setUpThreads) {
      thread.lastActivityAt = LAST_ACTIVITY_AT;
      participants.push({
        threadId: thread.id,
        workspaceMemberId,
        lastReadAt: thread.lastActivityAt,
      });
    }

    return setUpThreads.map((thread) => ({ ...thread }));
  };

  const manager = {
    query: jest.fn(async (sql: string, parameters: unknown[]) => {
      if (sql.startsWith('INSERT INTO "agentChatThread"')) {
        const [id, , workspaceMemberId] = parameters as string[];
        const thread = { id, workspaceMemberId, lastActivityAt: null };

        threads.push(thread);

        return [thread];
      }

      if (sql.startsWith('SELECT * FROM "agentChatThread"')) {
        const [threadIds] = parameters as [string[]];

        return threads
          .filter(
            (thread) =>
              threadIds.includes(thread.id) &&
              thread.workspaceMemberId === null,
          )
          .map((thread) => ({ ...thread }));
      }

      if (sql.includes('SET "workspaceMemberId" = $2')) {
        const [threadIds, workspaceMemberId] = parameters as [string[], string];
        const assignedThreads = threads.filter(
          (thread) =>
            threadIds.includes(thread.id) && thread.workspaceMemberId === null,
        );

        for (const thread of assignedThreads) {
          thread.workspaceMemberId = workspaceMemberId;
        }

        return assignedThreads.map((thread) => ({ ...thread }));
      }

      if (sql.includes('"agentChatThreadParticipant"')) {
        if (sql.startsWith('SELECT')) {
          const [threadIds] = parameters as [string[]];

          return participants.filter(({ threadId }) =>
            threadIds.includes(threadId),
          );
        }

        return setUpInboxState(sql, parameters);
      }

      if (sql.includes('"recordShare"')) {
        return [{ id: 'owner-grant-id' }];
      }

      throw new Error(`Unexpected query: ${sql}`);
    }),
  };

  const threadRepository = {
    query: jest.fn(
      async (
        _workspaceId: string,
        work: (context: {
          manager: typeof manager;
          table: (name: string) => string;
        }) => Promise<unknown>,
      ) => work({ manager, table: (name) => `"${name}"` }),
    ),
  };

  return { threads, participants, manager, threadRepository };
};

const buildContext = ({
  threads = [],
  hasInboxState = true,
}: {
  threads?: Thread[];
  hasInboxState?: boolean;
} = {}) => {
  const storage = buildStorage(threads);
  const events: string[] = [];
  const workspaceOrmManager = {
    executeInWorkspaceContext: jest.fn(async (work: () => unknown) => work()),
    getRepositoryWithContextPermissions: () => ({
      validateWriteIsPermitted: jest.fn(),
    }),
  };
  const sharingService = new AgentChatSharingService(
    storage.threadRepository as never,
    {} as never,
    { deleteByRecordIdsInTransaction: jest.fn() } as never,
    {} as never,
    {} as never,
    {} as never,
    workspaceOrmManager as never,
    {} as never,
    {} as never,
  );

  jest
    .spyOn(sharingService, 'findParticipantObjectMetadataId')
    .mockResolvedValue(
      hasInboxState ? PARTICIPANT_OBJECT_METADATA_ID : undefined,
    );
  jest.spyOn(sharingService, 'getAuthContext').mockResolvedValue({
    workspaceMemberId: CREATOR_ID,
    userWorkspaceId: CREATOR_USER_WORKSPACE_ID,
  } as never);
  jest
    .spyOn(
      sharingService as unknown as {
        getThreadObjectMetadata: () => Promise<unknown>;
      },
      'getThreadObjectMetadata',
    )
    .mockResolvedValue({ id: 'thread-object-metadata-id' });

  const recordEventService = {
    emit: jest.fn(async ({ objectName, before, after }) => {
      if (!after) {
        return;
      }

      if (objectName === 'agentChatThreadParticipant') {
        events.push(`participant created ${after.threadId}`);
      } else {
        events.push(`thread ${before ? 'updated' : 'created'} ${after.id}`);
      }
    }),
  };
  const threadService = new AgentChatThreadService(
    storage.threadRepository as never,
    sharingService,
    recordEventService as never,
    {} as never,
  );

  return {
    ...storage,
    events,
    threadService,
    recordEventService,
    createOneHook: new AgentChatThreadCreateOnePostQueryHook(threadService),
    createManyHook: new AgentChatThreadCreateManyPostQueryHook(threadService),
  };
};

describe('agentChatThread record API creation', () => {
  it('gives the creator a read participant row and sorts the thread by its creation', async () => {
    const context = buildContext({
      threads: [
        { id: 'new-thread', workspaceMemberId: null, lastActivityAt: null },
      ],
    });

    await context.createOneHook.execute(creatorAuthContext, 'agentChatThread', [
      { id: 'new-thread' },
    ]);

    expect(context.threads).toEqual([
      {
        id: 'new-thread',
        workspaceMemberId: CREATOR_ID,
        lastActivityAt: LAST_ACTIVITY_AT,
      },
    ]);
    expect(context.participants).toEqual([
      {
        threadId: 'new-thread',
        workspaceMemberId: CREATOR_ID,
        lastReadAt: LAST_ACTIVITY_AT,
      },
    ]);
    expect(context.events).toEqual([
      'participant created new-thread',
      'thread updated new-thread',
    ]);
  });

  it('sets up every created thread, and leaves alone those another member owns', async () => {
    const context = buildContext({
      threads: [
        { id: 'first-thread', workspaceMemberId: null, lastActivityAt: null },
        { id: 'second-thread', workspaceMemberId: null, lastActivityAt: null },
        {
          id: 'upserted-thread',
          workspaceMemberId: 'other-member-id',
          lastActivityAt: null,
        },
      ],
    });

    await context.createManyHook.execute(
      creatorAuthContext,
      'agentChatThread',
      [
        { id: 'first-thread' },
        { id: 'second-thread' },
        { id: 'upserted-thread' },
      ],
    );

    expect(context.participants).toEqual([
      {
        threadId: 'first-thread',
        workspaceMemberId: CREATOR_ID,
        lastReadAt: LAST_ACTIVITY_AT,
      },
      {
        threadId: 'second-thread',
        workspaceMemberId: CREATOR_ID,
        lastReadAt: LAST_ACTIVITY_AT,
      },
    ]);
    expect(context.threads[2]).toEqual({
      id: 'upserted-thread',
      workspaceMemberId: 'other-member-id',
      lastActivityAt: null,
    });
  });

  it('only assigns the creator in a workspace whose 2.46 inbox commands have not run', async () => {
    const context = buildContext({
      threads: [
        { id: 'new-thread', workspaceMemberId: null, lastActivityAt: null },
      ],
      hasInboxState: false,
    });

    await context.createOneHook.execute(creatorAuthContext, 'agentChatThread', [
      { id: 'new-thread' },
    ]);

    expect(context.participants).toEqual([]);
    expect(context.threads[0]).toEqual({
      id: 'new-thread',
      workspaceMemberId: CREATOR_ID,
      lastActivityAt: null,
    });
    expect(context.events).toEqual(['thread updated new-thread']);
  });

  it('sets up the inbox state the same way as createChatThread', async () => {
    const context = buildContext();

    const thread = await context.threadService.createThread({
      workspaceId: WORKSPACE_ID,
      workspaceMemberId: CREATOR_ID,
      id: 'chat-thread',
    });

    expect(thread.lastActivityAt).toBe(LAST_ACTIVITY_AT);
    expect(context.participants).toEqual([
      {
        threadId: 'chat-thread',
        workspaceMemberId: CREATOR_ID,
        lastReadAt: LAST_ACTIVITY_AT,
      },
    ]);
    expect(context.events).toEqual([
      'participant created chat-thread',
      'thread created chat-thread',
    ]);
  });
});
