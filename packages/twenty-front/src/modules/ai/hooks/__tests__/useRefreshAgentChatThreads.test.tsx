import { act, renderHook } from '@testing-library/react';
import { atom, createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { agentChatSnoozedThreadListState } from '@/ai/states/agentChatSnoozedThreadListState';
import { agentChatThreadListRefreshCountState } from '@/ai/states/agentChatThreadListRefreshCountState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadStreamedParticipantsState } from '@/ai/states/agentChatThreadStreamedParticipantsState';
import { agentChatThreadRecordUpdateCountState } from '@/ai/states/agentChatThreadRecordUpdateCountState';
import { agentChatUsageFamilyState } from '@/ai/states/agentChatUsageFamilyState';
import { agentChatThreadsSelector } from '@/ai/states/selectors/agentChatThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';

const queryMock = jest.fn();
const mockApolloCoreClient = { query: queryMock };

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => mockApolloCoreClient,
}));

const chatObjectMetadataItemAtom = atom<unknown>({
  id: 'chat-object',
  nameSingular: 'agentChatThread',
  namePlural: 'agentChatThreads',
  fields: [{ name: 'title' }, { name: 'lastActivityAt' }],
  readableFields: [{ name: 'title' }],
});

const participantObjectMetadataItemAtom = atom<unknown>({
  id: 'participant-object',
  nameSingular: 'agentChatThreadParticipant',
  namePlural: 'agentChatThreadParticipants',
  readableFields: [{ name: 'threadId' }, { name: 'snoozedUntil' }],
});

jest.mock('@/object-metadata/states/objectMetadataItemFamilySelector', () => ({
  objectMetadataItemFamilySelector: {
    selectorFamily: ({ objectName }: { objectName: string }) =>
      objectName === 'agentChatThreadParticipant'
        ? participantObjectMetadataItemAtom
        : chatObjectMetadataItemAtom,
  },
}));

jest.mock('@/object-record/utils/generateFindManyRecordsQuery', () => ({
  generateFindManyRecordsQuery: () => 'find-many-agent-chat-threads',
}));

const refreshAgentChatThreadPermissions = jest.fn();

jest.mock('@/ai/hooks/useRefreshAgentChatThreadPermissions', () => ({
  useRefreshAgentChatThreadPermissions: () => ({
    refreshAgentChatThreadPermissions,
  }),
}));

const buildThread = (id: string, title: string): AgentChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id,
  title,
  deletedAt: null,
  createdAt: '2026-09-07T00:00:00.000Z',
  updatedAt: '2026-09-07T00:00:00.000Z',
});

const buildPage = (
  threads: AgentChatThreadRecord[],
  { hasNextPage = false, endCursor = 'end' } = {},
) => ({
  data: {
    agentChatThreads: {
      edges: threads.map((thread) => ({ node: thread, cursor: thread.id })),
      pageInfo: {
        hasNextPage,
        hasPreviousPage: false,
        startCursor: 'start',
        endCursor,
      },
      totalCount: threads.length,
    },
  },
});

const buildStore = () => createStore();

const getWrapper = (store: ReturnType<typeof createStore>) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <JotaiProvider store={store}>{children}</JotaiProvider>;
  };

const renderRefresh = (store: ReturnType<typeof createStore>) =>
  renderHook(() => useRefreshAgentChatThreads(), {
    wrapper: getWrapper(store),
  }).result;

describe('useRefreshAgentChatThreads', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    refreshAgentChatThreadPermissions.mockResolvedValue(undefined);
  });

  it('keeps the refresh callback stable so render updates do not restart subscriptions', () => {
    const store = buildStore();
    const { result, rerender } = renderHook(
      () => useRefreshAgentChatThreads(),
      { wrapper: getWrapper(store) },
    );
    const refresh = result.current.refreshAgentChatThreads;
    rerender();
    expect(result.current.refreshAgentChatThreads).toBe(refresh);
  });

  it('loads the most recently active chats and the member read state', async () => {
    const store = buildStore();
    const thread = buildThread('thread-1', 'Loaded thread');
    queryMock.mockResolvedValue(buildPage([thread], { hasNextPage: true }));
    const result = renderRefresh(store);

    await act(async () => {
      await result.current.refreshAgentChatThreads();
    });

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          orderBy: [{ lastActivityAt: 'DescNullsLast' }],
          lastCursor: null,
        }),
        fetchPolicy: 'network-only',
      }),
    );
    expect(store.get(agentChatThreadListState.atom)).toEqual({
      threadIds: ['thread-1'],
      hasNextPage: true,
      endCursor: 'end',
    });
    expect(store.get(agentChatThreadsSelector.atom)).toMatchObject([
      { id: 'thread-1', title: 'Loaded thread' },
    ]);
    expect(store.get(agentChatThreadListRefreshCountState.atom)).toBe(1);
  });

  it("keeps the member's own inbox state from the page, and newer streamed rows", async () => {
    const store = buildStore();
    store.set(currentWorkspaceMemberState.atom, {
      id: 'member-id',
    } as never);
    const buildParticipant = (
      threadId: string,
      workspaceMemberId: string,
      updatedAt: string,
    ) => ({
      __typename: 'AgentChatThreadParticipant',
      id: `${threadId}-${workspaceMemberId}`,
      threadId,
      workspaceMemberId,
      lastReadAt: '2026-10-01T10:00:00.000Z',
      archivedAt: null,
      snoozedUntil: null,
      isSubscribed: true,
      lastMentionedAt: null,
      mentionsResolvedAt: null,
      updatedAt,
    });
    const streamedParticipant = {
      __typename: 'AgentChatThreadParticipant' as const,
      id: 'thread-2-member-id',
      threadId: 'thread-2',
      lastReadAt: null,
      archivedAt: null,
      snoozedUntil: null,
      isSubscribed: true,
      lastMentionedAt: null,
      mentionsResolvedAt: null,
      updatedAt: '2026-10-01T10:05:00.000Z',
    };
    store.set(agentChatThreadStreamedParticipantsState.atom, {
      'thread-2': streamedParticipant,
    });
    queryMock.mockResolvedValue(
      buildPage([
        {
          ...buildThread('thread-1', 'First'),
          participants: {
            edges: [
              {
                node: buildParticipant(
                  'thread-1',
                  'member-id',
                  '2026-10-01T10:00:00.000Z',
                ),
              },
              {
                node: buildParticipant(
                  'thread-1',
                  'other-member-id',
                  '2026-10-01T10:00:00.000Z',
                ),
              },
            ],
          },
        } as AgentChatThreadRecord,
        {
          ...buildThread('thread-2', 'Second'),
          participants: {
            edges: [
              {
                node: buildParticipant(
                  'thread-2',
                  'member-id',
                  '2026-10-01T10:00:00.000Z',
                ),
              },
            ],
          },
        } as AgentChatThreadRecord,
      ]),
    );
    const result = renderRefresh(store);

    await act(async () => {
      await result.current.refreshAgentChatThreads();
    });

    expect(store.get(agentChatThreadParticipantsState.atom)).toEqual({
      'thread-1': {
        __typename: 'AgentChatThreadParticipant' as const,
        id: 'thread-1-member-id',
        threadId: 'thread-1',
        lastReadAt: '2026-10-01T10:00:00.000Z',
        archivedAt: null,
        snoozedUntil: null,
        isSubscribed: true,
        lastMentionedAt: null,
        mentionsResolvedAt: null,
        updatedAt: '2026-10-01T10:00:00.000Z',
      },
      'thread-2': streamedParticipant,
    });
    expect(store.get(agentChatThreadsSelector.atom)[0]).not.toHaveProperty(
      'participants',
    );
  });

  it('pages personal snoozes by deadline independently of global activity and inaccessible targets', async () => {
    const store = buildStore();
    const globalList = {
      threadIds: ['recent-global-thread'],
      hasNextPage: true,
      endCursor: 'global-page',
    };
    const buildParticipant = ({
      threadId,
      snoozedUntil,
    }: {
      threadId: string;
      snoozedUntil: string;
    }) => ({
      id: `${threadId}-member-id`,
      threadId,
      workspaceMemberId: 'member-id',
      snoozedUntil,
      archivedAt: '2026-11-03T10:00:00.000Z',
      isSubscribed: true,
      updatedAt: '2026-11-03T10:00:00.000Z',
    });
    const buildParticipantPage = ({
      threadIds,
      hasNextPage,
      endCursor,
    }: {
      threadIds: string[];
      hasNextPage: boolean;
      endCursor: string | null;
    }) => ({
      data: {
        agentChatThreadParticipants: {
          edges: threadIds.map((threadId, index) => ({
            node: buildParticipant({
              threadId,
              snoozedUntil:
                threadId === 'next-snoozed-thread'
                  ? '2026-11-05T09:00:00.000Z'
                  : `2026-11-04T${index === 0 ? '09' : '15'}:00:00.000Z`,
            }),
            cursor: threadId,
          })),
          pageInfo: { hasNextPage, endCursor },
        },
      },
    });

    store.set(currentWorkspaceMemberState.atom, { id: 'member-id' } as never);
    store.set(agentChatThreadListState.atom, globalList);
    queryMock
      .mockResolvedValueOnce(
        buildParticipantPage({
          threadIds: ['inaccessible'],
          hasNextPage: true,
          endCursor: 'inaccessible-page',
        }),
      )
      .mockResolvedValueOnce(buildPage([]))
      .mockResolvedValueOnce(
        buildParticipantPage({
          threadIds: ['earliest-old-activity', 'later-new-activity'],
          hasNextPage: true,
          endCursor: 'snoozed-page',
        }),
      )
      .mockResolvedValueOnce(
        buildPage([
          buildThread('later-new-activity', 'Later'),
          buildThread('earliest-old-activity', 'Earliest'),
        ]),
      )
      .mockResolvedValueOnce(
        buildParticipantPage({
          threadIds: ['next-snoozed-thread'],
          hasNextPage: false,
          endCursor: null,
        }),
      )
      .mockResolvedValueOnce(
        buildPage([buildThread('next-snoozed-thread', 'Next')]),
      );
    const result = renderRefresh(store);

    await act(async () => {
      await result.current.refreshAgentChatSnoozedThreads();
    });

    expect(queryMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        variables: expect.objectContaining({
          filter: {
            workspaceMemberId: { eq: 'member-id' },
            isSubscribed: { eq: true },
            archivedAt: { is: 'NOT_NULL' },
            snoozedUntil: { is: 'NOT_NULL' },
          },
          orderBy: [
            { snoozedUntil: 'AscNullsLast' },
            { threadId: 'DescNullsLast' },
          ],
          lastCursor: null,
        }),
      }),
    );
    expect(store.get(agentChatSnoozedThreadListState.atom)).toEqual({
      threadIds: ['earliest-old-activity', 'later-new-activity'],
      hasNextPage: true,
      endCursor: 'snoozed-page',
      lastLoadedSortAt: '2026-11-04T15:00:00.000Z',
      lastLoadedThreadId: 'later-new-activity',
    });

    await act(async () => {
      await result.current.fetchMoreAgentChatSnoozedThreads();
    });

    expect(queryMock).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({
        variables: expect.objectContaining({ lastCursor: 'snoozed-page' }),
      }),
    );
    expect(store.get(agentChatSnoozedThreadListState.atom)).toEqual({
      threadIds: [
        'earliest-old-activity',
        'later-new-activity',
        'next-snoozed-thread',
      ],
      hasNextPage: false,
      endCursor: null,
      lastLoadedSortAt: '2026-11-05T09:00:00.000Z',
      lastLoadedThreadId: 'next-snoozed-thread',
    });
    expect(store.get(agentChatThreadListState.atom)).toBe(globalList);
    expect(store.get(agentChatThreadListRefreshCountState.atom)).toBe(0);
  });

  it('appends the next page after the loaded chats', async () => {
    const store = buildStore();
    queryMock
      .mockResolvedValueOnce(
        buildPage([buildThread('thread-1', 'First')], {
          hasNextPage: true,
          endCursor: 'page-1',
        }),
      )
      .mockResolvedValueOnce(
        buildPage([buildThread('thread-2', 'Second')], { endCursor: 'page-2' }),
      );
    const result = renderRefresh(store);

    await act(async () => {
      await result.current.refreshAgentChatThreads();
      await result.current.fetchMoreAgentChatThreads();
    });

    expect(queryMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ lastCursor: 'page-1' }),
      }),
    );
    expect(store.get(agentChatThreadListState.atom)).toEqual({
      threadIds: ['thread-1', 'thread-2'],
      hasNextPage: false,
      endCursor: 'page-2',
    });

    await act(async () => {
      expect(await result.current.fetchMoreAgentChatThreads()).toBeUndefined();
    });
    expect(queryMock).toHaveBeenCalledTimes(2);
  });

  it('retries when a record event changes the list during the request', async () => {
    const store = buildStore();
    const serverThreads = [
      buildThread('thread-1', 'Newer title'),
      buildThread('thread-2', 'Server thread'),
    ];
    let resolveQuery: (value: ReturnType<typeof buildPage>) => void = () =>
      undefined;

    queryMock
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveQuery = resolve;
        }),
      )
      .mockResolvedValueOnce(buildPage(serverThreads));
    const result = renderRefresh(store);

    const refreshPromise = result.current.refreshAgentChatThreads();

    act(() => {
      store.set(agentChatThreadListState.atom, {
        threadIds: ['thread-1'],
        hasNextPage: false,
        endCursor: null,
      });
    });

    let refreshedThreads: AgentChatThreadRecord[] | undefined;

    await act(async () => {
      resolveQuery(buildPage([buildThread('thread-1', 'Stale title')]));
      refreshedThreads = await refreshPromise;
    });

    expect(refreshedThreads).toMatchObject([
      { id: 'thread-1', title: 'Newer title' },
      { id: 'thread-2' },
    ]);
    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(store.get(agentChatThreadListState.atom)?.threadIds).toEqual([
      'thread-1',
      'thread-2',
    ]);
  });

  it('retries rather than overwrite a chat updated during the request', async () => {
    const store = buildStore();
    let resolveQuery: (value: ReturnType<typeof buildPage>) => void = () =>
      undefined;

    queryMock
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveQuery = resolve;
        }),
      )
      .mockResolvedValueOnce(
        buildPage([buildThread('thread-1', 'Renamed meanwhile')]),
      );
    const result = renderRefresh(store);

    const refreshPromise = result.current.refreshAgentChatThreads();

    act(() => {
      store.set(agentChatThreadRecordUpdateCountState.atom, 1);
    });

    await act(async () => {
      resolveQuery(buildPage([buildThread('thread-1', 'Stale title')]));
      await refreshPromise;
    });

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(store.get(agentChatThreadsSelector.atom)).toMatchObject([
      { id: 'thread-1', title: 'Renamed meanwhile' },
    ]);
  });

  it('stops retrying when record events keep changing the list', async () => {
    const store = buildStore();
    let changeCount = 0;
    queryMock.mockImplementation(async () => {
      changeCount++;
      store.set(agentChatThreadListState.atom, {
        threadIds: [`thread-${changeCount}`],
        hasNextPage: false,
        endCursor: null,
      });
      return buildPage([buildThread('thread-1', 'Stale title')]);
    });
    const result = renderRefresh(store);

    await act(async () => {
      expect(await result.current.refreshAgentChatThreads()).toBeUndefined();
    });

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(store.get(agentChatThreadListState.atom)?.threadIds).toEqual([
      'thread-2',
    ]);
  });

  it('drops chats the server no longer lists', async () => {
    const store = buildStore();
    store.set(agentChatThreadListState.atom, {
      threadIds: ['thread-1', 'thread-2'],
      hasNextPage: false,
      endCursor: null,
    });
    queryMock.mockResolvedValue(
      buildPage([buildThread('thread-1', 'Refreshed title')]),
    );
    const result = renderRefresh(store);

    await act(async () => {
      await result.current.refreshAgentChatThreads();
    });

    expect(store.get(agentChatThreadListState.atom)?.threadIds).toEqual([
      'thread-1',
    ]);
  });

  it('leaves the list unloaded so initialization can retry a failed request', async () => {
    const store = buildStore();
    queryMock.mockRejectedValue(new Error('Network error'));
    const result = renderRefresh(store);

    await act(async () => {
      await result.current.refreshAgentChatThreads();
    });

    expect(store.get(agentChatThreadListState.atom)).toBeNull();
  });

  it('adds a chat opened past the loaded pages, and tells a missing chat from a failed lookup', async () => {
    const store = buildStore();
    store.set(agentChatThreadListState.atom, {
      threadIds: ['thread-1'],
      hasNextPage: true,
      endCursor: 'page-1',
    });
    const result = renderRefresh(store);

    queryMock.mockResolvedValueOnce(
      buildPage([buildThread('old-thread', 'Old chat')]),
    );
    await act(async () => {
      expect(
        await result.current.loadAgentChatThread('old-thread'),
      ).toMatchObject({ id: 'old-thread' });
    });
    expect(queryMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          filter: expect.objectContaining({
            and: expect.arrayContaining([{ id: { eq: 'old-thread' } }]),
          }),
        }),
      }),
    );
    expect(store.get(agentChatThreadListState.atom)?.threadIds).toEqual([
      'old-thread',
      'thread-1',
    ]);

    queryMock.mockResolvedValueOnce(buildPage([]));
    await act(async () => {
      expect(await result.current.loadAgentChatThread('gone')).toBeNull();
    });

    queryMock.mockRejectedValueOnce(new Error('Network error'));
    await act(async () => {
      expect(
        await result.current.loadAgentChatThread('unknown'),
      ).toBeUndefined();
    });
  });

  it('restores the usage of a chat opened past the loaded pages', async () => {
    const store = buildStore();
    queryMock.mockResolvedValueOnce(
      buildPage([
        {
          ...buildThread('old-thread', 'Old chat'),
          conversationSize: 3,
          contextWindowTokens: 1000,
          totalInputTokens: 42,
        },
      ]),
    );
    const result = renderRefresh(store);

    await act(async () => {
      await result.current.loadAgentChatThread('old-thread');
    });

    expect(
      store.get(
        agentChatUsageFamilyState.atomFamily({ threadId: 'old-thread' }),
      ),
    ).toMatchObject({ inputTokens: 42 });
  });

  it('looks a chat up again rather than overwrite an update applied during the request', async () => {
    const store = buildStore();
    let resolveQuery: (value: ReturnType<typeof buildPage>) => void = () =>
      undefined;

    queryMock
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveQuery = resolve;
        }),
      )
      .mockResolvedValueOnce(
        buildPage([buildThread('old-thread', 'Renamed meanwhile')]),
      );
    store.set(agentChatThreadListState.atom, {
      threadIds: [],
      hasNextPage: true,
      endCursor: 'page-1',
    });
    const result = renderRefresh(store);

    const loadPromise = result.current.loadAgentChatThread('old-thread');

    act(() => {
      store.set(agentChatThreadRecordUpdateCountState.atom, 1);
    });

    await act(async () => {
      resolveQuery(buildPage([buildThread('old-thread', 'Stale title')]));
      await loadPromise;
    });

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(store.get(agentChatThreadsSelector.atom)).toMatchObject([
      { id: 'old-thread', title: 'Renamed meanwhile' },
    ]);
  });
});
