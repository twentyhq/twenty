import { act, renderHook } from '@testing-library/react';
import { atom, createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useFetchMoreAgentChatThreadsInFilterStatus } from '@/ai/hooks/useFetchMoreAgentChatThreadsInFilterStatus';
import { useRefreshAgentChatThreadsInFilterStatus } from '@/ai/hooks/useRefreshAgentChatThreadsInFilterStatus';
import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
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

const renderChatThreadLoadingHook = <THookResult,>({
  store,
  hook,
}: {
  store: ReturnType<typeof createStore>;
  hook: () => THookResult;
}) => renderHook(hook, { wrapper: getWrapper(store) }).result;

describe('inbox tab pages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    refreshAgentChatThreadPermissions.mockResolvedValue(undefined);
  });

  const buildStoreWithList = () => {
    const store = buildStore();

    store.set(currentWorkspaceMemberState.atom, { id: 'member-id' } as never);
    store.set(agentChatThreadListState.atom, {
      threadIds: ['recent-thread'],
      hasNextPage: true,
      endCursor: 'all-chats-page-1',
    });

    return store;
  };

  it("adds the tab's chats to the list, past the pages of every chat", async () => {
    const store = buildStoreWithList();
    queryMock.mockResolvedValue({
      data: {
        agentChatThreads: {
          ...buildPage(
            [
              buildThread('recent-thread', 'Recent'),
              buildThread('old-open-thread', 'Old'),
            ],
            { hasNextPage: true, endCursor: 'tab-page-1' },
          ).data.agentChatThreads,
          totalCount: 120,
        },
      },
    });
    const result = renderChatThreadLoadingHook({
      store,
      hook: useRefreshAgentChatThreadsInFilterStatus,
    });

    await act(async () => {
      await result.current.refreshAgentChatThreadsInFilterStatus('active');
    });

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          lastCursor: null,
          filter: {
            and: [
              expect.anything(),
              {
                and: [
                  { deletedAt: { is: 'NULL' } },
                  expect.objectContaining({
                    participants: expect.objectContaining({
                      workspaceMemberId: { eq: 'member-id' },
                    }),
                  }),
                ],
              },
            ],
          },
        }),
      }),
    );
    expect(store.get(agentChatThreadListState.atom)).toEqual({
      threadIds: ['recent-thread', 'old-open-thread'],
      hasNextPage: true,
      endCursor: 'all-chats-page-1',
      filterStatusPages: {
        active: {
          hasNextPage: true,
          endCursor: 'tab-page-1',
          totalCount: 120,
        },
      },
    });
  });

  it('continues a tab from its own cursor, and stops once the tab is loaded', async () => {
    const store = buildStoreWithList();
    store.set(agentChatThreadListState.atom, {
      threadIds: ['recent-thread'],
      hasNextPage: true,
      endCursor: 'all-chats-page-1',
      filterStatusPages: {
        done: { hasNextPage: true, endCursor: 'done-page-1', totalCount: 2 },
        active: { hasNextPage: false, endCursor: null, totalCount: 1 },
      },
    });
    queryMock.mockResolvedValue(
      buildPage([buildThread('done-thread', 'Done')], {
        endCursor: 'done-page-2',
      }),
    );
    const result = renderChatThreadLoadingHook({
      store,
      hook: useFetchMoreAgentChatThreadsInFilterStatus,
    });

    await act(async () => {
      await result.current.fetchMoreAgentChatThreadsInFilterStatus('active');
    });

    expect(queryMock).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.fetchMoreAgentChatThreadsInFilterStatus('done');
    });

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ lastCursor: 'done-page-1' }),
      }),
    );
    expect(
      store.get(agentChatThreadListState.atom)?.filterStatusPages?.done,
    ).toEqual({
      hasNextPage: false,
      endCursor: 'done-page-2',
      totalCount: 1,
    });
  });

  it('keeps paging a tab while its pages only hold chats the list already has', async () => {
    const store = buildStoreWithList();
    store.set(agentChatThreadListState.atom, {
      threadIds: ['recent-thread'],
      hasNextPage: true,
      endCursor: 'all-chats-page-1',
      filterStatusPages: {
        assigned: {
          hasNextPage: true,
          endCursor: 'assigned-page-1',
          totalCount: 3,
        },
      },
    });
    queryMock
      .mockResolvedValueOnce(
        buildPage([buildThread('recent-thread', 'Recent')], {
          hasNextPage: true,
          endCursor: 'assigned-page-2',
        }),
      )
      .mockResolvedValue(
        buildPage([buildThread('older-thread', 'Older')], {
          endCursor: 'assigned-page-3',
        }),
      );
    const result = renderChatThreadLoadingHook({
      store,
      hook: useFetchMoreAgentChatThreadsInFilterStatus,
    });

    await act(async () => {
      await result.current.fetchMoreAgentChatThreadsInFilterStatus('assigned');
    });

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ lastCursor: 'assigned-page-2' }),
      }),
    );
    expect(store.get(agentChatThreadListState.atom)).toMatchObject({
      threadIds: ['recent-thread', 'older-thread'],
      filterStatusPages: {
        assigned: { hasNextPage: false, endCursor: 'assigned-page-3' },
      },
    });
  });

  it('starts the tabs over when the list is refreshed', async () => {
    const store = buildStoreWithList();
    store.set(agentChatThreadListState.atom, {
      threadIds: ['recent-thread', 'old-open-thread'],
      hasNextPage: true,
      endCursor: 'all-chats-page-1',
      filterStatusPages: {
        active: { hasNextPage: false, endCursor: null, totalCount: 2 },
      },
    });
    queryMock.mockResolvedValue(
      buildPage([buildThread('recent-thread', 'Recent')], {
        hasNextPage: true,
      }),
    );
    const result = renderChatThreadLoadingHook({
      store,
      hook: useRefreshAgentChatThreads,
    });

    await act(async () => {
      await result.current.refreshAgentChatThreads();
    });

    expect(
      store.get(agentChatThreadListState.atom)?.filterStatusPages,
    ).toBeUndefined();
  });
});
