import { act, renderHook } from '@testing-library/react';
import { atom, createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { AGENT_CHAT_INSTANCE_ID } from '@/ai/constants/AgentChatInstanceId';
import { agentChatThreadRecordUpdateCountState } from '@/ai/states/agentChatThreadRecordUpdateCountState';
import { agentChatUsageComponentFamilyState } from '@/ai/states/agentChatUsageComponentFamilyState';
import { agentChatThreadsSelector } from '@/ai/states/selectors/agentChatThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

const queryMock = jest.fn();
const mockApolloCoreClient = { query: queryMock };

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => mockApolloCoreClient,
}));

const chatObjectMetadataItemAtom = atom<unknown>({
  id: 'chat-object',
  nameSingular: 'agentChatThread',
  namePlural: 'agentChatThreads',
  fields: [{ name: 'title' }],
  readableFields: [{ name: 'title' }],
});

jest.mock('@/object-metadata/states/objectMetadataItemFamilySelector', () => ({
  objectMetadataItemFamilySelector: {
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

  it('loads the most recently updated chats through the record API', async () => {
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
          orderBy: [{ updatedAt: 'DescNullsLast' }],
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
        agentChatUsageComponentFamilyState.atomFamily({
          instanceId: AGENT_CHAT_INSTANCE_ID,
          familyKey: { threadId: 'old-thread' },
        }),
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
