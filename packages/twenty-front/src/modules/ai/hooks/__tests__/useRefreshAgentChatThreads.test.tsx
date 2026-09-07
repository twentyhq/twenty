import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
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
  beforeEach(() => {
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

  it('preserves newer store updates while adding threads from the response', async () => {
    const store = createStore();
    const newerThread = buildThread('thread-1', 'Newer title');
    const staleThread = buildThread('thread-1', 'Stale title');
    const missingThread = buildThread('thread-2', 'Missing thread');
    let resolveQuery: (value: {
      data: { chatThreads: AgentChatThread[] };
    }) => void = () => undefined;

    queryMock.mockReturnValue(
      new Promise((resolve) => {
        resolveQuery = resolve;
      }),
    );
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

    await act(async () => {
      resolveQuery({ data: { chatThreads: [staleThread, missingThread] } });
      await refreshPromise;
    });

    expect(
      store.get(metadataStoreState.atomFamily('agentChatThreads')).current,
    ).toEqual([newerThread, missingThread]);
  });

  it('finishes an empty initial load when the request fails', async () => {
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
      status: 'up-to-date',
    });
  });
});
