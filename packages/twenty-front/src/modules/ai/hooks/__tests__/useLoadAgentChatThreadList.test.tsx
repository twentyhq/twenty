import { act, renderHook } from '@testing-library/react';
import { atom, createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { useLoadAgentChatThread } from '@/ai/hooks/useLoadAgentChatThread';
import { useLoadAgentChatThreadList } from '@/ai/hooks/useLoadAgentChatThreadList';
import { AGENT_CHAT_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { agentChatThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { getAgentChatThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadStreamedParticipantsState } from '@/ai/states/agentChatThreadStreamedParticipantsState';
import { agentChatUsageFamilyState } from '@/ai/states/agentChatUsageFamilyState';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { agentChatFavoriteThreadsSelector } from '@/ai/states/selectors/agentChatFavoriteThreadsSelector';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const queryMock = jest.fn();
const mockApolloCoreClient = { query: queryMock };

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useApolloClient: () => mockApolloCoreClient,
}));

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

jest.mock('@/object-metadata/states/objectMetadataItemFamilySelector', () => ({
  objectMetadataItemFamilySelector: {
    type: 'FamilySelector',
    selectorFamily: () => chatObjectMetadataItemAtom,
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

const RECENT_THREAD_LIST_ATOM = agentChatThreadListFamilyState.atomFamily(
  getAgentChatThreadListSourceKey(AGENT_CHAT_RECENT_THREAD_LIST_SOURCE),
);

const buildStore = () => {
  const store = createStore();

  store.set(currentUserWorkspaceState.atom, {
    permissionFlags: [PermissionFlagType.AI],
  } as never);

  return store;
};

const getWrapper = (store: ReturnType<typeof createStore>) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <JotaiProvider store={store}>{children}</JotaiProvider>;
  };

const useAgentChatThreadLoading = () => {
  const { loadAgentChatThreadList } = useLoadAgentChatThreadList();

  return {
    loadAgentChatThreadList,
    refreshAgentChatThreads: () =>
      loadAgentChatThreadList({
        source: AGENT_CHAT_RECENT_THREAD_LIST_SOURCE,
        mode: 'refresh',
      }),
    fetchMoreAgentChatThreads: () =>
      loadAgentChatThreadList({
        source: AGENT_CHAT_RECENT_THREAD_LIST_SOURCE,
        mode: 'fetch-more',
      }),
    ...useLoadAgentChatThread(),
  };
};

const renderRefresh = (store: ReturnType<typeof createStore>) =>
  renderHook(() => useAgentChatThreadLoading(), {
    wrapper: getWrapper(store),
  }).result;

describe('useLoadAgentChatThreadList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    refreshAgentChatThreadPermissions.mockResolvedValue(undefined);
  });

  it('keeps the refresh callback stable so render updates do not restart subscriptions', () => {
    const store = buildStore();
    const { result, rerender } = renderHook(
      () => useLoadAgentChatThreadList(),
      { wrapper: getWrapper(store) },
    );
    const load = result.current.loadAgentChatThreadList;
    rerender();
    expect(result.current.loadAgentChatThreadList).toBe(load);
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
    expect(store.get(RECENT_THREAD_LIST_ATOM)).toEqual({
      threadIds: ['thread-1'],
      hasNextPage: true,
      endCursor: 'end',
      lastLoadedActivityAt: null,
    });
    expect(store.get(agentChatRecentThreadsSelector.atom)).toMatchObject([
      { id: 'thread-1', title: 'Loaded thread' },
    ]);
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
    expect(
      store.get(agentChatRecentThreadsSelector.atom)[0],
    ).not.toHaveProperty('participants');
  });

  it('loads a favorite outside the page without changing the main pagination', async () => {
    const store = buildStore();
    const favoriteThread = {
      ...buildThread('favorite-thread', 'An outdated pair name'),
      conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
      directMessageFirstWorkspaceMemberId: 'member-1',
      directMessageSecondWorkspaceMemberId: 'member-2',
    };

    store.set(metadataStoreState.atomFamily('navigationMenuItems'), {
      current: [
        {
          id: 'favorite-navigation-item',
          type: NavigationMenuItemType.RECORD,
          userWorkspaceId: 'user-workspace-id',
          targetObjectMetadataId: 'chat-object',
          targetRecordId: favoriteThread.id,
          targetRecordIdentifier: {
            id: favoriteThread.id,
            labelIdentifier: 'An outdated pair name',
          },
          position: 0,
        },
      ],
      draft: [],
      status: 'up-to-date',
    });
    queryMock
      .mockResolvedValueOnce(
        buildPage([buildThread('recent-thread', 'Recent chat')], {
          hasNextPage: true,
          endCursor: 'recent-page-cursor',
        }),
      )
      .mockResolvedValueOnce(
        buildPage([favoriteThread], { endCursor: 'favorite-page-cursor' }),
      );
    const result = renderRefresh(store);

    await act(async () => {
      await result.current.refreshAgentChatThreads();
    });

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(queryMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          filter: expect.objectContaining({
            and: expect.arrayContaining([{ id: { in: ['favorite-thread'] } }]),
          }),
          lastCursor: null,
        }),
      }),
    );
    expect(
      store.get(
        agentChatThreadRecordFamilySelector.selectorFamily('favorite-thread'),
      ),
    ).toMatchObject(favoriteThread);
    expect(store.get(agentChatFavoriteThreadsSelector.atom)).toMatchObject([
      {
        id: 'favorite-thread',
        conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
        directMessageFirstWorkspaceMemberId: 'member-1',
        directMessageSecondWorkspaceMemberId: 'member-2',
      },
    ]);
    expect(store.get(RECENT_THREAD_LIST_ATOM)).toEqual({
      threadIds: ['recent-thread'],
      hasNextPage: true,
      endCursor: 'recent-page-cursor',
      lastLoadedActivityAt: null,
    });
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
    expect(store.get(RECENT_THREAD_LIST_ATOM)).toEqual({
      threadIds: ['thread-1', 'thread-2'],
      hasNextPage: false,
      endCursor: 'page-2',
      lastLoadedActivityAt: null,
    });

    await act(async () => {
      expect(await result.current.fetchMoreAgentChatThreads()).toBeUndefined();
    });
    expect(queryMock).toHaveBeenCalledTimes(2);
  });

  it('drops chats the server no longer lists', async () => {
    const store = buildStore();
    store.set(RECENT_THREAD_LIST_ATOM, {
      threadIds: ['thread-1', 'thread-2'],
      hasNextPage: false,
      endCursor: null,
      lastLoadedActivityAt: null,
    });
    queryMock.mockResolvedValue(
      buildPage([buildThread('thread-1', 'Refreshed title')]),
    );
    const result = renderRefresh(store);

    await act(async () => {
      await result.current.refreshAgentChatThreads();
    });

    expect(store.get(RECENT_THREAD_LIST_ATOM)?.threadIds).toEqual(['thread-1']);
  });

  it('leaves the list unloaded so initialization can retry a failed request', async () => {
    const store = buildStore();
    queryMock.mockRejectedValue(new Error('Network error'));
    const result = renderRefresh(store);

    await act(async () => {
      await result.current.refreshAgentChatThreads();
    });

    expect(store.get(RECENT_THREAD_LIST_ATOM)).toBeNull();
  });

  it('adds a chat opened past the loaded pages, and tells a missing chat from a failed lookup', async () => {
    const store = buildStore();
    store.set(RECENT_THREAD_LIST_ATOM, {
      threadIds: ['thread-1'],
      hasNextPage: true,
      endCursor: 'page-1',
      lastLoadedActivityAt: null,
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
    expect(store.get(RECENT_THREAD_LIST_ATOM)?.threadIds).toEqual([
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
});
