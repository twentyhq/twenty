import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { clearMetadataStoreStorage } from '@/metadata-store/storage/metadataStoreStorage';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type AgentChatThread } from '~/generated-metadata/graphql';

const queryMock = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useApolloClient: () => ({ query: queryMock }),
}));

const buildThread = (id: string, title: string): AgentChatThread => ({
  __typename: 'AgentChatThread',
  id,
  title,
  createdAt: '2026-09-07T00:00:00.000Z',
  updatedAt: '2026-09-07T00:00:00.000Z',
  lastMessageAt: '2026-09-07T00:00:00.000Z',
  totalInputTokens: 0,
  totalOutputTokens: 0,
  conversationSize: 0,
  totalInputCredits: 0,
  totalOutputCredits: 0,
});

const getWrapper = (store: ReturnType<typeof createStore>) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <JotaiProvider store={store}>{children}</JotaiProvider>;
  };

describe('useRefreshAgentChatThreads', () => {
  beforeEach(async () => {
    await clearMetadataStoreStorage();
    jest.clearAllMocks();
  });

  it('loads chat threads into an empty store', async () => {
    const store = createStore();
    const thread = buildThread('thread-1', 'Loaded thread');
    queryMock.mockResolvedValue({ data: { chatThreads: [thread] } });
    const { result } = renderHook(() => useRefreshAgentChatThreads(), {
      wrapper: getWrapper(store),
    });

    await act(async () => {
      await result.current.refreshAgentChatThreads();
    });

    expect(
      store.get(metadataStoreState.atomFamily('agentChatThreads')),
    ).toMatchObject({
      current: [thread],
      status: 'up-to-date',
    });
  });

  it('retries when the store changes during the request', async () => {
    const store = createStore();
    const newerThread = buildThread('thread-1', 'Newer title');
    const staleThread = buildThread('thread-1', 'Stale title');
    const serverOnlyThread = buildThread('thread-2', 'Server thread');
    let resolveQuery: (value: {
      data: { chatThreads: AgentChatThread[] };
    }) => void = () => undefined;

    queryMock
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveQuery = resolve;
        }),
      )
      .mockResolvedValueOnce({
        data: { chatThreads: [newerThread, serverOnlyThread] },
      });
    const { result } = renderHook(() => useRefreshAgentChatThreads(), {
      wrapper: getWrapper(store),
    });

    const refreshPromise = result.current.refreshAgentChatThreads();

    act(() => {
      store.set(metadataStoreState.atomFamily('agentChatThreads'), {
        current: [newerThread],
        draft: [],
        status: 'up-to-date',
      });
    });

    let refreshedThreads: AgentChatThread[] | undefined;

    await act(async () => {
      resolveQuery({ data: { chatThreads: [staleThread] } });
      refreshedThreads = await refreshPromise;
    });

    expect(refreshedThreads).toEqual([newerThread, serverOnlyThread]);
    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(
      store.get(metadataStoreState.atomFamily('agentChatThreads')).current,
    ).toEqual([newerThread, serverOnlyThread]);
  });

  it('applies server updates and removals when the store has not changed', async () => {
    const store = createStore();
    const staleThread = buildThread('thread-1', 'Stale title');
    const refreshedThread = buildThread('thread-1', 'Refreshed title');
    const removedThread = buildThread('thread-2', 'Removed thread');
    store.set(metadataStoreState.atomFamily('agentChatThreads'), {
      current: [staleThread, removedThread],
      draft: [],
      status: 'up-to-date',
    });
    queryMock.mockResolvedValue({
      data: { chatThreads: [refreshedThread] },
    });
    const { result } = renderHook(() => useRefreshAgentChatThreads(), {
      wrapper: getWrapper(store),
    });

    await act(async () => {
      await result.current.refreshAgentChatThreads();
    });

    expect(
      store.get(metadataStoreState.atomFamily('agentChatThreads')).current,
    ).toEqual([refreshedThread]);
  });

  it('keeps the store empty so initialization can retry a failed request', async () => {
    const store = createStore();
    queryMock.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useRefreshAgentChatThreads(), {
      wrapper: getWrapper(store),
    });

    await act(async () => {
      await result.current.refreshAgentChatThreads();
    });

    expect(
      store.get(metadataStoreState.atomFamily('agentChatThreads')),
    ).toMatchObject({
      current: [],
      status: 'empty',
    });
  });
});
